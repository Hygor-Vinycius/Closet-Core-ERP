from .base_service import BaseService
from repository import (
    CompraRepository,
    ItensCompraRepository, # Importado para clareza, embora BaseRepository seja usado implicitamente
    MovimentoEstoqueRepository,
    VariacaoProdutosRepository,
    FornecedorRepository,
    ContasAPagarRepository,
    PagamentoRepository
)
from sqlalchemy.orm import Session
from models import Compras, ItensCompra, MovimentoEstoque, ContasAPagar, VariacaoProdutos, Fornecedor
from fastapi import HTTPException
from typing import Optional, List
import datetime
from decimal import Decimal, ROUND_HALF_UP # Import Decimal e ROUND_HALF_UP

class ServiceCompra(BaseService[CompraRepository]):
    def __init__(self, session: Session):
        self.session = session # Manter a sessão para transações multi-repositório
        self.repository = CompraRepository(session)
        self.variacao_repo = VariacaoProdutosRepository(session)
        self.fornecedor_repo = FornecedorRepository(session)
        self.movimento_estoque_repo = MovimentoEstoqueRepository(session)
        self.contas_pagar_repo = ContasAPagarRepository(session)
        self.pagamento_repo = PagamentoRepository(session)
        self.itens_compra_repo = ItensCompraRepository(session)
        super().__init__(self.repository)

    def criar_compra(self, dados_compra: dict):
        """
        Orquestra a criação completa de uma nova compra, validando dados,
        registrando itens, gerando movimento de estoque, contas a pagar parceladas
        e atualizando o custo na variação do produto.
        """
        try:
            # 1. Extrair e validar dados do cabeçalho
            id_fornecedor = dados_compra.get('id_fornecedor')
            itens_info: List[dict] = dados_compra.get('itens', [])
            parcelas_info: List[dict] = dados_compra.get('parcelas', [])

            # Campos opcionais do cabeçalho
            chave_nfe = dados_compra.get('chave_acesso_nfe')
            nota_fiscal = dados_compra.get('nota_fiscal')
            status_compra = dados_compra.get('status', 'Recebida')
            ncm_cabecalho = dados_compra.get('ncm')
            cest_cst_cabecalho = dados_compra.get('cest_cst')
            icms_cabecalho = dados_compra.get('icms')
            pis_cabecalho = dados_compra.get('pis')
            icms_st_cabecalho = dados_compra.get('icms_st')
            difal_cabecalho = dados_compra.get('diferencial_aliquota')

            if not id_fornecedor or not itens_info:
                raise HTTPException(status_code=400, detail="ID do fornecedor e lista de itens são obrigatórios.")

            # Valida Fornecedor
            fornecedor: Fornecedor = self.fornecedor_repo.get_by_id(id_fornecedor) # Usa get_by_id herdado

            valor_total_compra = Decimal('0.0')
            itens_para_salvar: List[ItensCompra] = []
            movimentos_estoque_para_salvar: List[MovimentoEstoque] = []

            # 2. Validar itens, calcular totais, preparar objetos e ATUALIZAR CUSTO
            for item_info in itens_info:
                id_variacao = item_info.get('id_variacao')
                quantidade_str = item_info.get('quantidade')
                custo_unitario_str = item_info.get('custo_unitario')
                cfop_item = item_info.get('cfop')
                ncm_item = item_info.get('ncm')
                cest_cst_item = item_info.get('cest_cst')

                if not all([id_variacao, quantidade_str, custo_unitario_str]):
                    raise HTTPException(status_code=400, detail=f"Item inválido: {item_info}. Todos os itens devem ter id_variacao, quantidade e custo_unitario.")

                try:
                    quantidade = int(quantidade_str)
                    # Converte para Decimal garantindo duas casas decimais
                    custo_unitario = Decimal(str(custo_unitario_str)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                    if quantidade <= 0 or custo_unitario < 0:
                        raise ValueError("Quantidade e custo devem ser positivos.")
                except (ValueError, TypeError):
                     raise HTTPException(status_code=400, detail=f"Quantidade ({quantidade_str}) e Custo Unitário ({custo_unitario_str}) devem ser números válidos.")

                variacao: VariacaoProdutos = self.variacao_repo.get_by_id(id_variacao) # Usa get_by_id herdado

                valor_total_item = quantidade * custo_unitario
                valor_total_compra += valor_total_item

                item_compra = ItensCompra(
                    id_variacao=id_variacao,
                    quantidade=quantidade,
                    custo_unitario=custo_unitario,
                    valor_total_item=valor_total_item,
                    cfop=cfop_item, ncm=ncm_item, cest_cst=cest_cst_item
                )
                itens_para_salvar.append(item_compra)

                movimento = MovimentoEstoque(
                    id_variacao=id_variacao,
                    tipo_movimento='ENTRADA POR COMPRA',
                    quantidade=quantidade, # Positivo para entrada
                    id_fornecedor=id_fornecedor
                )
                movimentos_estoque_para_salvar.append(movimento)

                # --- ATUALIZAÇÃO DO CUSTO NA VARIAÇÃO ---
                variacao.custo = custo_unitario # Atualiza o custo no cadastro da variação
                self.session.add(variacao) # Adiciona a variação modificada à sessão
                # ----------------------------------------

            # 3. Criar o objeto Compra (cabeçalho)
            nova_compra = Compras(
                id_fornecedor=id_fornecedor,
                valor_total=valor_total_compra,
                nota_fiscal=nota_fiscal, chave_acesso_nfe=chave_nfe, status=status_compra,
                ncm=ncm_cabecalho, cest_cst=cest_cst_cabecalho, icms=icms_cabecalho,
                pis=pis_cabecalho, icms_st=icms_st_cabecalho, diferencial_aliquota=difal_cabecalho
            )
            nova_compra.itens_compra.extend(itens_para_salvar)

            # --- INÍCIO DA TRANSAÇÃO ---
            self.session.add(nova_compra)
            self.session.flush() # Obter ID da compra

            # 5. Associar movimentos de estoque e adicionar à sessão
            if not nova_compra.id_compra:
                 raise Exception("Falha ao obter o ID da nova compra após o flush.") # Segurança extra
            for movimento in movimentos_estoque_para_salvar:
                movimento.referencia_movimento = nova_compra.id_compra
                self.session.add(movimento)

            # --- 6. GERAÇÃO DE CONTAS A PAGAR PARCELADAS (SEM FORMA PGTO) ---
            if not parcelas_info:
                 raise HTTPException(status_code=400, detail="É necessário informar os detalhes das parcelas.")

            valor_total_parcelas = Decimal('0.0')
            contas_pagar_para_salvar: List[ContasAPagar] = []
            num_parcela_atual = 1

            for parcela_info in parcelas_info:
                data_vencimento_str = parcela_info.get('data_vencimento')
                valor_parcela_str = parcela_info.get('valor_parcela')

                if not data_vencimento_str or not valor_parcela_str:
                    raise HTTPException(status_code=400, detail=f"Parcela {num_parcela_atual} inválida: data_vencimento e valor_parcela são obrigatórios.")

                try:
                    data_vencimento = datetime.datetime.strptime(data_vencimento_str, '%Y-%m-%d').date()
                    valor_parcela = Decimal(str(valor_parcela_str)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                    if valor_parcela <= 0:
                        raise ValueError("Valor da parcela deve ser positivo.")
                except (ValueError, TypeError):
                     raise HTTPException(status_code=400, detail=f"Formato inválido para data_vencimento ('{data_vencimento_str}', esperado AAAA-MM-DD) ou valor_parcela ('{valor_parcela_str}') na parcela {num_parcela_atual}.")

                valor_total_parcelas += valor_parcela

                conta_pagar = ContasAPagar(
                    id_compra=nova_compra.id_compra,
                    id_fornecedor=id_fornecedor,
                    # Assumindo que ContasAPagar tenha 'numero_parcela' para o índice
                    # Se não tiver, ajuste ou remova esta linha
                    num_parcelas=num_parcela_atual,
                    data_emissao=datetime.date.today(),
                    data_vencimento=data_vencimento,
                    valor_original=valor_parcela,
                    saldo_devedor=valor_parcela,
                    status_conta='Aberto'
                )
                contas_pagar_para_salvar.append(conta_pagar)
                num_parcela_atual += 1

            # Validação final: Soma das parcelas bate com o total da compra?
            tolerancia = Decimal('0.01')
            if abs(valor_total_parcelas - valor_total_compra) > tolerancia:
                 raise HTTPException(status_code=400, detail=f"A soma das parcelas ({valor_total_parcelas}) não corresponde ao valor total da compra ({valor_total_compra}).")

            self.session.add_all(contas_pagar_para_salvar)

            # 7. Finalizar a Transação (Commit)
            self.session.commit()
            self.session.refresh(nova_compra) # Recarrega a compra e seus relacionamentos

            # --- FIM DA TRANSAÇÃO ---

            return nova_compra

        except HTTPException:
            self.session.rollback() # Garante rollback mesmo em erros HTTP
            raise
        except Exception as e:
            # Qualquer outro erro (ex: banco de dados), desfaz tudo
            self.session.rollback()
            print(f"Erro detalhado ao criar compra: {e}") # Log detalhado no servidor
            # Retorna um erro genérico 500 para o cliente
            raise HTTPException(status_code=500, detail="Ocorreu um erro interno ao processar a compra.")

    # --- Outros Métodos ---

    def listar_compras(self, id_fornecedor: Optional[int] = None, status: Optional[str] = None):
        """Lista compras com filtros."""
        filters = {}
        if id_fornecedor:
            filters['id_fornecedor'] = id_fornecedor
        if status:
            filters['status'] = status

        if filters:
             # O find_by genérico pode ser usado se o modelo Compra tiver 'status'
             return self.repository.find_by(**filters)
        return self.repository.get_all() # Retorna todas se não houver filtros

    def cancelar_compra(self, compra_id: int, motivo: Optional[str] = "Cancelamento"):
        """
        Cancela uma compra por erro de digitação ou similar.
        Verifica se existem pagamentos antes de prosseguir.
        Reverte o financeiro (Contas a Pagar) e o estoque (MovimentoEstoque).
        """
        try:
            # 1. Busca a compra (já trata 404)
            compra: Compras = self.get_by_id(compra_id)

            if compra.status == 'Cancelada':
                 raise HTTPException(status_code=409, detail="Esta compra já foi cancelada.")

            # 2. Busca as contas a pagar relacionadas
            contas_a_pagar_da_compra = self.contas_pagar_repo.find_by(id_compra=compra_id)
            contas_ids = [conta.id_cta_a_pgto for conta in contas_a_pagar_da_compra]

            # 3. VERIFICAÇÃO CRUCIAL: Existem pagamentos ativos para estas contas?
            if self.pagamento_repo.existem_pagamentos_ativos_para_contas(contas_ids):
                raise HTTPException(status_code=409, # Conflict
                                    detail="Não é possível cancelar a compra pois existem pagamentos efetivados. Estorne os pagamentos primeiro.")

            # 4. Busca os itens da compra
            itens_comprados = self.itens_compra_repo.find_by_compra_id(compra_id)

            # --- INÍCIO DAS REVERSÕES (se não houver pagamentos) ---

            # 5. Cancelar Contas a Pagar
            for conta in contas_a_pagar_da_compra:
                conta.status_conta = 'Cancelado'
                conta.saldo_devedor = Decimal('0.0')
                self.session.add(conta)

            # 6. Estornar Movimento de Estoque (Criar novos movimentos)
            movimentos_estorno_para_salvar: List[MovimentoEstoque] = []
            for item in itens_comprados:
                # NÃO precisamos buscar a variação aqui, apenas registrar o movimento
                movimento_estorno = MovimentoEstoque(
                    id_variacao=item.id_variacao,
                    tipo_movimento='SAIDA POR CANCELAMENTO COMPRA', # Ou 'ESTORNO DE COMPRA'
                    quantidade=(-1 * item.quantidade), # Quantidade NEGATIVA para estorno
                    id_fornecedor=compra.id_fornecedor, # Mantém referência ao fornecedor
                    referencia_movimento=compra.id_compra # Referencia a compra cancelada
                )
                movimentos_estorno_para_salvar.append(movimento_estorno)
            
            self.session.add_all(movimentos_estorno_para_salvar)

            # 7. Alterar Status da Compra
            compra.status = 'Cancelada' # Ou adicionar o motivo
            self.session.add(compra)

            # 8. Efetivar todas as alterações no banco (Commit)
            self.session.commit()
            self.session.refresh(compra)

            return compra

        except HTTPException:
            self.session.rollback()
            raise
        except Exception as e:
            self.session.rollback()
            print(f"Erro ao cancelar compra {compra_id}: {e}")
            raise HTTPException(status_code=500, detail="Erro interno ao cancelar compra.")