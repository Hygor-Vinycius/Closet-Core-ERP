# Em: services/pagamento_service.py

from .base_service import BaseService
from repository import PagamentoRepository, ContasAPagarRepository
from sqlalchemy.orm import Session
from models import Pagamentos, ContasAPagar
from fastapi import HTTPException
from decimal import Decimal, ROUND_HALF_UP
import datetime
from typing import List # <-- NOVO IMPORT ADICIONADO

class ServicePagamento(BaseService[PagamentoRepository]):
    def __init__(self, session: Session):
        self.session = session
        self.repository = PagamentoRepository(session)
        self.contas_pagar_repo = ContasAPagarRepository(session)
        super().__init__(self.repository)

    def registrar_pagamento(self, dados_pagamento: dict):
        """
        Registra um novo pagamento para uma conta a pagar.
        """
        id_cta_a_pgto = dados_pagamento.get('id_cta_a_pgto')
        valor_pagamento_str = dados_pagamento.get('valor_pagamento')
        data_pagamento_str = dados_pagamento.get('data_pagamento') # Espera AAAA-MM-DD
        id_forma_pgto = dados_pagamento.get('id_forma_pgto')
        valor_juros_str = dados_pagamento.get('valor_juros', '0')
        valor_desconto_str = dados_pagamento.get('valor_desconto', '0')

        # Validações básicas
        if not all([id_cta_a_pgto, valor_pagamento_str, data_pagamento_str, id_forma_pgto]):
            raise HTTPException(status_code=400, detail="Dados do pagamento incompletos.")

        # Converte para Decimal
        try:
            valor_pagamento = Decimal(valor_pagamento_str)
            valor_juros = Decimal(valor_juros_str)
            valor_desconto = Decimal(valor_desconto_str)
        except Exception:
            raise HTTPException(status_code=400, detail="Valores de pagamento inválidos.")

        # Converte data
        try:
            data_pagamento = datetime.datetime.fromisoformat(data_pagamento_str).date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de data inválido. Use AAAA-MM-DD.")

        # Inicia a transação
        try:
            # 1. Busca a conta a pagar
            conta = self.contas_pagar_repo.get_by_id(id_cta_a_pgto)
            if not conta:
                raise HTTPException(status_code=404, detail="Conta a pagar não encontrada.")
            if conta.status_conta == 'Cancelado':
                raise HTTPException(status_code=409, detail="Esta conta está cancelada e não pode receber pagamentos.")

            # 2. Calcula o valor efetivo pago (considerando juros e descontos)
            valor_efetivo_pago = valor_pagamento + valor_juros - valor_desconto

            # 3. Cria o novo registro de pagamento
            novo_pagamento = Pagamentos(
                id_cta_a_pgto=id_cta_a_pgto,
                valor_pagamento=valor_pagamento,
                data_pagamento=data_pagamento,
                id_forma_pgto=id_forma_pgto,
                valor_juros=valor_juros,
                valor_desconto=valor_desconto,
                status='Efetivado' # Pagamentos já nascem efetivados
            )

            # 4. Atualiza a conta a pagar
            conta.valor_pago = (conta.valor_pago or Decimal('0.0')) + valor_efetivo_pago
            conta.saldo_devedor = conta.valor_original - conta.valor_pago

            # 5. Atualiza o Status da Conta (já corrigido)
            if conta.saldo_devedor <= Decimal('0.01'):
                conta.saldo_devedor = Decimal('0.0') # Zera o saldo
                conta.status_conta = 'Pago' # Usa "Pago"
            else:
                conta.status_conta = 'Pago Parcial'
            
            self.session.add(novo_pagamento)
            self.session.add(conta)
            self.session.commit()
            self.session.refresh(novo_pagamento)

            return novo_pagamento

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            print(f"Erro ao registrar pagamento: {e}")
            raise HTTPException(status_code=500, detail="Erro interno ao processar o pagamento.")


    def cancelar_pagamento(self, pagamento_id: int):
        """
        Cancela/Estorna um pagamento de compra existente.
        """
        try:
            # 1. Busca o pagamento
            pagamento = self.repository.get_by_id(pagamento_id)
            if not pagamento:
                raise HTTPException(status_code=404, detail="Pagamento não encontrado.")
            if pagamento.status == 'Cancelado':
                raise HTTPException(status_code=409, detail="Este pagamento já foi cancelado.")

            # 2. Busca a conta a pagar associada
            conta = self.contas_pagar_repo.get_by_id(pagamento.id_cta_a_pgto)
            if not conta:
                raise HTTPException(status_code=404, detail="Conta a pagar associada não encontrada.")
            
            # 3. Calcula o valor que foi efetivamente abatido da dívida
            valor_efetivo_pago = pagamento.valor_pagamento + (pagamento.valor_juros or Decimal('0.0')) - (pagamento.valor_desconto or Decimal('0.0'))

            # 4. Reverte valores na conta a pagar
            conta.valor_pago = (conta.valor_pago or Decimal('0.0')) - valor_efetivo_pago
            conta.saldo_devedor += valor_efetivo_pago

            # 5. Reajusta Status da Conta
            if conta.saldo_devedor > conta.valor_original + Decimal('0.01'):
                 conta.saldo_devedor = conta.valor_original
                 
            if conta.valor_pago <= Decimal('0.01'):
                conta.status_conta = 'Aberto'
                conta.valor_pago = Decimal('0.0') 
            else:
                conta.status_conta = 'Pago Parcial'

            # 6. Atualiza status do pagamento
            pagamento.status = 'Cancelado'

            self.session.add(pagamento)
            self.session.add(conta)
            self.session.commit()
            self.session.refresh(pagamento)

            return pagamento

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            print(f"Erro ao cancelar pagamento {pagamento_id}: {e}")
            raise HTTPException(status_code=500, detail="Erro interno ao processar o cancelamento.")

    def listar_por_conta(self, id_cta_a_pgto: int) -> List[Pagamentos]:
        """
        Lista todos os pagamentos associados a uma conta a pagar específica.
        """
        return self.repository.find_by_conta_a_pagar_id(id_cta_a_pgto)