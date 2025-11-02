from .base_service import BaseService
from repository import RecebimentoRepository, ContasAReceberRepository # Importe ambos
from sqlalchemy.orm import Session
from models import Recebimentos, ContasAReceber
from fastapi import HTTPException
from decimal import Decimal, ROUND_HALF_UP
import datetime

class ServiceRecebimento(BaseService[RecebimentoRepository]):
    def __init__(self, session: Session):
        self.session = session
        self.repository = RecebimentoRepository(session)
        self.contas_receber_repo = ContasAReceberRepository(session) # Instancie o repo de ContasAReceber
        super().__init__(self.repository)

    def registrar_recebimento(self, dados_recebimento: dict):
        """
        Registra um novo recebimento para uma conta a receber,
        calcula o valor líquido e atualiza o saldo da conta.
        """
        id_cta_a_receber = dados_recebimento.get('id_cta_a_receber')
        valor_pagamento_str = dados_recebimento.get('valor_pagamento') # Valor bruto recebido
        data_pagamento_str = dados_recebimento.get('data_pagamento') # Espera AAAA-MM-DD
        id_forma_pgto = dados_recebimento.get('id_forma_pgto')
        valor_juros_str = dados_recebimento.get('valor_juros', '0') # Juros cobrados do cliente
        valor_desconto_str = dados_recebimento.get('valor_desconto', '0') # Desconto concedido
        valor_tx_maquininha_str = dados_recebimento.get('valor_tx_maquininha', '0') # Taxa descontada pela operadora

        # Validações básicas
        if not all([id_cta_a_receber, valor_pagamento_str, data_pagamento_str, id_forma_pgto]):
            raise HTTPException(status_code=400, detail="id_cta_a_receber, valor_pagamento, data_pagamento e id_forma_pgto são obrigatórios.")

        try:
            valor_pagamento = Decimal(str(valor_pagamento_str)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            data_pagamento = datetime.datetime.strptime(data_pagamento_str, '%Y-%m-%d').date()
            valor_juros = Decimal(str(valor_juros_str)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            valor_desconto = Decimal(str(valor_desconto_str)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            valor_tx_maquininha = Decimal(str(valor_tx_maquininha_str)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            if valor_pagamento <= 0: raise ValueError("Valor do pagamento deve ser positivo.")
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Valores ou data de recebimento inválidos.")

        # --- Início da Transação ---
        try:
            # Busca a conta a receber
            conta: ContasAReceber = self.contas_receber_repo.get_by_id(id_cta_a_receber)
            if conta is None:
                raise HTTPException(status_code=404, detail=f"Conta a receber com ID {id_cta_a_receber} não encontrada.")

            if conta.status_conta not in ['Aberto', 'Recebido Parcial']:
                raise HTTPException(status_code=409, detail=f"Conta a receber {id_cta_a_receber} não está aberta para recebimento (Status: {conta.status_conta}).")

            # Valor efetivamente considerado para abater a dívida do cliente
            valor_abatimento_divida = valor_pagamento + valor_juros - valor_desconto
            
            # Valor líquido que entra no caixa da empresa
            valor_liquido = valor_pagamento - valor_tx_maquininha 

            # Valida se o abatimento não excede (muito) o saldo devedor
            if valor_abatimento_divida > conta.saldo_devedor + Decimal('0.01'): # Tolerância
                 raise HTTPException(status_code=400, detail=f"Valor a abater da dívida ({valor_abatimento_divida}) excede o saldo devedor ({conta.saldo_devedor}).")

            # Cria o registro de recebimento
            novo_recebimento = Recebimentos(
                id_cta_a_receber=id_cta_a_receber,
                valor_pagamento=valor_pagamento, # Valor bruto
                data_pagamento=data_pagamento,
                id_forma_pgto=id_forma_pgto,
                valor_juros=valor_juros,
                valor_desconto=valor_desconto,
                valor_tx_maquininha=valor_tx_maquininha,
                valor_liquido=valor_liquido # Valor líquido calculado
                # Status não parece existir na tabela recebimentos, se precisar, adicione
            )

            # Atualiza a conta a receber
            conta.valor_pago = (conta.valor_pago or Decimal('0.0')) + valor_abatimento_divida
            conta.saldo_devedor -= valor_abatimento_divida

            # Define o status da conta
            if conta.saldo_devedor <= Decimal('0.01'): # Pago com tolerância
                conta.status_conta = 'Recebido Total'
                conta.saldo_devedor = Decimal('0.0') # Zera
            else:
                conta.status_conta = 'Recebido Parcial'

            self.session.add(novo_recebimento)
            self.session.add(conta) # Adiciona a conta modificada
            self.session.commit()
            self.session.refresh(novo_recebimento)
            
            return novo_recebimento

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            print(f"Erro ao registrar recebimento: {e}")
            raise HTTPException(status_code=500, detail="Erro interno ao registrar recebimento.")

    # Implementar cancelar_recebimento seria o próximo passo lógico
    # get_by_id para recebimentos é herdado

    def cancelar_recebimento(self, recebimento_id: int):
        """
        Cancela um recebimento existente, revertendo os valores na conta a receber.
        """
        try:
            # Busca o recebimento (usa get_by_id herdado que trata 404)
            recebimento: Recebimentos = self.get_by_id(recebimento_id)

            if recebimento.status == 'Cancelado':
                raise HTTPException(status_code=409, detail="Este recebimento já foi cancelado.")

            # Busca a conta a receber associada
            conta: ContasAReceber = self.contas_receber_repo.get_by_id(recebimento.id_cta_a_receber)
            if not conta:
                raise HTTPException(status_code=404, detail=f"Conta a receber associada (ID: {recebimento.id_cta_a_receber}) não encontrada.")

            # --- Início da Reversão ---
            # Valor que foi considerado para abater a dívida no recebimento original
            valor_abatimento_original = recebimento.valor_pagamento + (recebimento.valor_juros or Decimal('0.0')) - (recebimento.valor_desconto or Decimal('0.0'))

            # Reverte valores na conta a receber
            conta.valor_pago = (conta.valor_pago or Decimal('0.0')) - valor_abatimento_original
            conta.saldo_devedor += valor_abatimento_original

            # Reajusta Status da Conta (Ex: se estava Recebido Total, volta para Aberto ou Parcial)
            # Garante que o saldo não fique maior que o original devido a arredondamentos
            if conta.saldo_devedor > conta.valor_original + Decimal('0.01'):
                 conta.saldo_devedor = conta.valor_original

            if conta.valor_pago <= Decimal('0.01'):
                conta.status_conta = 'Aberto'
                conta.valor_pago = Decimal('0.0') # Zera se ficou negativo ou muito pequeno
            else:
                conta.status_conta = 'Recebido Parcial'

            # Atualiza status do recebimento
            recebimento.status = 'Cancelado'

            self.session.add(recebimento)
            self.session.add(conta)
            self.session.commit()
            self.session.refresh(recebimento)

            return recebimento

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            print(f"Erro ao cancelar recebimento {recebimento_id}: {e}")
            raise HTTPException(status_code=500, detail="Erro interno ao cancelar recebimento.")