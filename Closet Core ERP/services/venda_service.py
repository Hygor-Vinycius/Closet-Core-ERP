from .base_service import BaseService
from repository import VendaRepository, VariacaoProdutosRepository, ContasAReceberRepository, ItensVendaRepository
from sqlalchemy.orm import Session
from models import Vendas, ItensVenda, ContasAReceber
from fastapi import HTTPException

class ServiceVenda(BaseService[VendaRepository]):
    def __init__(self, session: Session):
        # O serviço de Venda precisa acessar múltiplos repositórios
        self.session = session
        self.repository = VendaRepository(session)
        self.variacao_repo = VariacaoProdutosRepository(session)
        self.contas_receber_repo = ContasAReceberRepository(session) # Assumindo que você criará este repo
        self.itens_venda_repo = ItensVendaRepository(session)
        super().__init__(self.repository)

    def criar_venda(self, dados_venda: dict):
        """
        Orquestra a criação completa de uma nova venda.
        """
        try:
            # 1. Extrair dados do JSON
            id_cliente = dados_venda.get('id_cliente')
            id_usuario = dados_venda.get('id_usuario')
            itens_info = dados_venda.get('itens', []) # Espera uma lista de {'id_variacao': x, 'quantidade': y}

            if not all([id_cliente, id_usuario, itens_info]):
                raise HTTPException(status_code=400, detail="Dados da venda incompletos.")

            valor_total_venda = 0
            itens_para_salvar = []
            
            # 2. Validar itens e calcular o total
            for item_info in itens_info:
                id_variacao = item_info.get('id_variacao')
                quantidade = item_info.get('quantidade')
                
                variacao = self.variacao_repo.get_by_id(id_variacao)
                if not variacao:
                    raise HTTPException(status_code=404, detail=f"Variação de produto com ID {id_variacao} não encontrada.")
                if variacao.estoque_atual < quantidade:
                    raise HTTPException(status_code=409, detail=f"Estoque insuficiente para a variação {variacao.sku} (ID: {id_variacao}).")

                subtotal = variacao.preco_venda * quantidade
                valor_total_venda += subtotal

                # Prepara o objeto ItensVenda
                item_venda = ItensVenda(
                    id_variacao=id_variacao,
                    quantidade=quantidade,
                    preco_unitario=variacao.preco_venda,
                    subtotal=subtotal
                )
                itens_para_salvar.append(item_venda)

                # Abate o estoque (o commit só acontece no final)
                variacao.estoque_atual -= quantidade
                self.session.add(variacao)

            # 3. Criar o objeto Venda
            nova_venda = Vendas(
                id_cliente=id_cliente,
                id_usuario=id_usuario,
                valor_total=valor_total_venda,
                status='Finalizada' # Status inicial
            )
            
            # Adiciona os itens à venda (o SQLAlchemy cuida da FK)
            nova_venda.itens_venda.extend(itens_para_salvar)
            
            # 4. Salvar a venda e os itens
            self.session.add(nova_venda)
            self.session.flush() # Força a geração do ID da venda antes do commit

            # 5. Gerar o Contas a Receber (exemplo simples de 1 parcela)
            conta_a_receber = ContasAReceber(
                id_venda=nova_venda.id_venda,
                id_cliente=id_cliente,
                numero_parcela=1,
                data_emissao=nova_venda.data_venda,
                data_vencimento=nova_venda.data_venda, # Simplificado: vencimento no mesmo dia
                valor_original=valor_total_venda,
                saldo_devedor=valor_total_venda,
                status_conta='Aberto'
            )
            self.session.add(conta_a_receber)

            # 6. Finalizar a Transação
            self.session.commit()
            self.session.refresh(nova_venda)
            
            return nova_venda

        except Exception as e:
            # 7. Se qualquer coisa der errado, desfaz tudo
            self.session.rollback()
            # Re-levanta a exceção para que o FastAPI a capture e retorne o erro HTTP correto
            raise e
        
    def cancelar_venda(self, venda_id: int):
        """
        Cancela uma venda existente, revertendo o estoque e o financeiro.
        """
        try:
            # 1. Busca a venda (já trata o 404 se não existir)
            venda = self.get_by_id(venda_id)

            # 2. Verifica se a venda já está cancelada (evita reprocessamento)
            if venda.status == 'Cancelada':
                raise HTTPException(status_code=409, detail="Esta venda já foi cancelada.")

            # 3. Busca os itens da venda
            itens_vendidos = self.itens_venda_repo.find_by_venda_id(venda_id)

            # 4. Busca as contas a receber relacionadas
            contas_a_receber = self.contas_receber_repo.buscar(id_venda=venda_id) # Usando método buscar do repo

            # --- INÍCIO DAS REVERSÕES ---

            # 5. Reverter Estoque
            for item in itens_vendidos:
                variacao = self.variacao_repo.get_by_id(item.id_variacao)
                if variacao: # Segurança extra, embora improvável de ser None
                    variacao.estoque_atual += item.quantidade
                    self.session.add(variacao) # Adiciona ao gerenciamento da sessão
                else:
                     # Log ou tratamento para caso a variação tenha sido deletada fisicamente (improvável)
                    print(f"AVISO: Variação {item.id_variacao} não encontrada ao cancelar venda {venda_id}")


            # 6. Reverter Contas a Receber
            for conta in contas_a_receber:
                conta.status_conta = 'Cancelado'
                conta.saldo_devedor = 0 # Boa prática zerar o saldo
                self.session.add(conta)

            # 7. Alterar Status da Venda
            venda.status = 'Cancelada'
            self.session.add(venda)

            # 8. Efetivar todas as alterações no banco (Commit)
            self.session.commit()
            self.session.refresh(venda) # Recarrega os dados da venda

            return venda

        except HTTPException:
             # Se for um HTTPException (404, 409), apenas propaga o erro
            raise
        except Exception as e:
            # 9. Se qualquer outro erro ocorrer, desfaz tudo (Rollback)
            self.session.rollback()
            print(f"Erro ao cancelar venda {venda_id}: {e}") # Log do erro
            raise HTTPException(status_code=500, detail="Ocorreu um erro interno ao cancelar a venda.")