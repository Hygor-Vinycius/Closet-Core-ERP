from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date
from models import Vendas, ItensVenda, ContasAReceber, ContasAPagar, VariacaoProdutos, Produtos, CategoriaProdutos

class ServiceDashboard:
    def __init__(self, session: Session):
        self.session = session

    def obter_dados_completos(self):
        hoje = date.today()
        ano_atual = hoje.year
        mes_atual = hoje.month

        # --- 1. KPIS PRINCIPAIS (Topo) ---
        
        # Faturamento Mês Atual
        faturamento_mes = self.session.query(func.sum(Vendas.valor_total))\
            .filter(extract('month', Vendas.data_venda) == mes_atual, 
                    extract('year', Vendas.data_venda) == ano_atual,
                    Vendas.status != 'Cancelada').scalar() or 0

        # Lucro Estimado Mês (Vendas - Custos)
        lucro_bruto = self.session.query(
            func.sum(
                (ItensVenda.quantidade * VariacaoProdutos.preco_venda) - 
                (ItensVenda.quantidade * VariacaoProdutos.custo) 
            )
        ).join(VariacaoProdutos, VariacaoProdutos.id_variacao == ItensVenda.id_variacao)\
         .join(Vendas, Vendas.id_venda == ItensVenda.id_venda)\
         .filter(extract('month', Vendas.data_venda) == mes_atual,
                 Vendas.status != 'Cancelada').scalar() or 0

        # Total a Receber (Geral)
        total_receber = self.session.query(func.sum(ContasAReceber.saldo_devedor))\
            .filter(ContasAReceber.status_conta.in_(['Aberto', 'Recebido Parcial'])).scalar() or 0

        # Total a Pagar (Geral)
        total_pagar = self.session.query(func.sum(ContasAPagar.saldo_devedor))\
            .filter(ContasAPagar.status_conta.in_(['Aberto', 'Pago Parcial'])).scalar() or 0

        # --- 2. GRÁFICO EVOLUÇÃO ANUAL (Vendas vs Custos) ---
        evolucao_query = self.session.query(
            extract('month', Vendas.data_venda).label('mes'),
            func.sum(Vendas.valor_total).label('vendas')
        ).filter(
            extract('year', Vendas.data_venda) == ano_atual,
            Vendas.status != 'Cancelada'
        ).group_by(extract('month', Vendas.data_venda)).all()

        meses_nomes = {1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
                       7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'}
        
        grafico_evolucao = []
        for m in evolucao_query:
            venda_val = float(m.vendas or 0)
            grafico_evolucao.append({
                "mes": meses_nomes[int(m.mes)],
                "vendas": venda_val,
                "custos": venda_val * 0.6, 
                "lucro": venda_val * 0.4
            })

        # --- 3. GRÁFICO PIZZA/BARRAS (Vendas por Categoria) ---
        categorias_query = self.session.query(
            CategoriaProdutos.descricao,
            func.sum(ItensVenda.quantidade)
        ).join(Produtos, Produtos.id_categoria_produto == CategoriaProdutos.id_categoria)\
         .join(VariacaoProdutos, VariacaoProdutos.id_produto == Produtos.id_produto)\
         .join(ItensVenda, ItensVenda.id_variacao == VariacaoProdutos.id_variacao)\
         .join(Vendas, Vendas.id_venda == ItensVenda.id_venda)\
         .filter(Vendas.status != 'Cancelada')\
         .group_by(CategoriaProdutos.descricao).all()

        grafico_pizza = [{"name": c[0], "value": c[1]} for c in categorias_query]

        # --- 4. TOP 5 PRODUTOS MAIS VENDIDOS (ADICIONADO AQUI) ---
        # Tenta buscar apenas as 'Finalizada'
        top_produtos_query = self.session.query(
            Produtos.nome_produto,
            VariacaoProdutos.sku,
            func.sum(ItensVenda.quantidade).label('total_vendido')
        ).join(ItensVenda, ItensVenda.id_variacao == VariacaoProdutos.id_variacao)\
         .join(Vendas, Vendas.id_venda == ItensVenda.id_venda)\
         .join(Produtos, Produtos.id_produto == VariacaoProdutos.id_produto)\
         .filter(func.lower(Vendas.status) == 'finalizada')\
         .group_by(Produtos.nome_produto, VariacaoProdutos.sku, VariacaoProdutos.id_variacao)\
         .order_by(func.sum(ItensVenda.quantidade).desc())\
         .limit(5).all()

        # Se não achar nada (talvez o banco antigo tenha outros status), busca tudo exceto Cancelada
        if not top_produtos_query:
             top_produtos_query = self.session.query(
                Produtos.nome_produto,
                VariacaoProdutos.sku,
                func.sum(ItensVenda.quantidade).label('total_vendido')
            ).join(ItensVenda, ItensVenda.id_variacao == VariacaoProdutos.id_variacao)\
             .join(Vendas, Vendas.id_venda == ItensVenda.id_venda)\
             .join(Produtos, Produtos.id_produto == VariacaoProdutos.id_produto)\
             .filter(Vendas.status != 'Cancelada')\
             .group_by(Produtos.nome_produto, VariacaoProdutos.sku, VariacaoProdutos.id_variacao)\
             .order_by(func.sum(ItensVenda.quantidade).desc())\
             .limit(5).all()

        top_produtos = [
            {"nome": f"{p[0]}", "sku": p[1], "qtd": p[2]} 
            for p in top_produtos_query
        ]

        # --- 5. TABELA ESTOQUE BAIXO ---
        estoque_baixo_query = self.session.query(
            Produtos.nome_produto,
            VariacaoProdutos.sku,
            VariacaoProdutos.estoque_atual
        ).join(Produtos, Produtos.id_produto == VariacaoProdutos.id_produto)\
         .filter(VariacaoProdutos.estoque_atual < 5, VariacaoProdutos.status == 'Ativo')\
         .order_by(VariacaoProdutos.estoque_atual.asc())\
         .limit(5).all()

        lista_estoque_baixo = [
            {"produto": f"{e[0]}", "sku": e[1], "qtd": e[2]} 
            for e in estoque_baixo_query
        ]

        return {
            "kpi": {
                "faturamento": faturamento_mes,
                "lucro": lucro_bruto,
                "a_receber": total_receber,
                "a_pagar": total_pagar
            },
            "grafico_evolucao": grafico_evolucao,
            "grafico_pizza": grafico_pizza, # Usado no gráfico de categorias
            "top_produtos": top_produtos,   # <-- AGORA ESTÁ AQUI!
            "estoque_baixo": lista_estoque_baixo
        }