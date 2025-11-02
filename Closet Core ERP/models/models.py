from typing import Optional
import datetime
import decimal

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKeyConstraint, Identity, Index, Integer, PrimaryKeyConstraint, VARCHAR, text
from sqlalchemy.dialects.oracle import NUMBER
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class CategoriaProdutos(Base):
    __tablename__ = 'categoria_produtos'
    __table_args__ = (
        PrimaryKeyConstraint('id_categoria', name='pk_categoria_produtos'),
    )

    id_categoria: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    descricao: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    data_criacao: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('SYSDATE '))
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')

    produtos: Mapped[list['Produtos']] = relationship('Produtos', back_populates='categoria_produtos')


class Clientes(Base):
    __tablename__ = 'clientes'
    __table_args__ = (
        CheckConstraint("\n        (tipo_cliente = 'PF' AND cpf IS NOT NULL AND cnpj IS NULL) OR\n        (tipo_cliente = 'PJ' AND cnpj IS NOT NULL AND cpf IS NULL)\n    ", name='chk_cliente_documento'),
        CheckConstraint("\n        (tipo_cliente = 'PF' AND cpf IS NOT NULL AND cnpj IS NULL) OR\n        (tipo_cliente = 'PJ' AND cnpj IS NOT NULL AND cpf IS NULL)\n    ", name='chk_cliente_documento'),
        CheckConstraint("\n        (tipo_cliente = 'PF' AND cpf IS NOT NULL AND cnpj IS NULL) OR\n        (tipo_cliente = 'PJ' AND cnpj IS NOT NULL AND cpf IS NULL)\n    ", name='chk_cliente_documento'),
        PrimaryKeyConstraint('id_cliente', name='pk_clientes'),
        Index('sys_c009703', 'cpf', unique=True),
        Index('sys_c009704', 'cnpj', unique=True),
        Index('sys_c009705', 'e_mail', unique=True)
    )

    id_cliente: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    nome_completo: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    tipo_cliente: Mapped[str] = mapped_column(Enum('PF', 'PJ'), nullable=False)
    telefone: Mapped[str] = mapped_column(VARCHAR(15), nullable=False)
    e_mail: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    data_cadastro: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('SYSDATE '))
    cpf: Mapped[Optional[str]] = mapped_column(VARCHAR(11))
    cnpj: Mapped[Optional[str]] = mapped_column(VARCHAR(14))
    razao_social: Mapped[Optional[str]] = mapped_column(VARCHAR(115))
    nome_fantasia: Mapped[Optional[str]] = mapped_column(VARCHAR(115))
    endereco: Mapped[Optional[str]] = mapped_column(VARCHAR(100))
    cidade: Mapped[Optional[str]] = mapped_column(VARCHAR(100))
    uf: Mapped[Optional[str]] = mapped_column(VARCHAR(2))
    cep: Mapped[Optional[str]] = mapped_column(VARCHAR(8))
    data_atualizacao: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')

    vendas: Mapped[list['Vendas']] = relationship('Vendas', back_populates='clientes')
    contas_a_receber: Mapped[list['ContasAReceber']] = relationship('ContasAReceber', back_populates='clientes')


class CondicaoPagamento(Base):
    __tablename__ = 'condicao_pagamento'
    __table_args__ = (
        PrimaryKeyConstraint('id_condicao', name='pk_condicao_pagamento'),
    )

    id_condicao: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    descricao: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    parcelas: Mapped[int] = mapped_column(Integer, nullable=False)
    intervalo_dias_parc: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')


class Empresa(Base):
    __tablename__ = 'empresa'
    __table_args__ = (
        PrimaryKeyConstraint('id_empresa', name='pk_empresa'),
        Index('sys_c009822', 'cnpj', unique=True)
    )

    id_empresa: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    cnpj: Mapped[str] = mapped_column(VARCHAR(14), nullable=False)
    razao_social: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    nome_fantasia: Mapped[Optional[str]] = mapped_column(VARCHAR(100))
    cnae_principal: Mapped[Optional[str]] = mapped_column(VARCHAR(7))
    natureza_juridica: Mapped[Optional[str]] = mapped_column(VARCHAR(4))
    endereco: Mapped[Optional[str]] = mapped_column(VARCHAR(200))
    cep: Mapped[Optional[str]] = mapped_column(VARCHAR(8))
    uf: Mapped[Optional[str]] = mapped_column(VARCHAR(2))
    email: Mapped[Optional[str]] = mapped_column(VARCHAR(100))
    telefone: Mapped[Optional[str]] = mapped_column(VARCHAR(15))
    whatsapp: Mapped[Optional[str]] = mapped_column(VARCHAR(15))
    data_atualizacao: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)


class FormasPagamentos(Base):
    __tablename__ = 'formas_pagamentos'
    __table_args__ = (
        PrimaryKeyConstraint('id_forma_pgto', name='pk_formas_pagamentos'),
        Index('sys_c009789', 'descricao', unique=True)
    )

    id_forma_pgto: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    descricao: Mapped[str] = mapped_column(VARCHAR(150), nullable=False)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')

    pagamentos: Mapped[list['Pagamentos']] = relationship('Pagamentos', back_populates='formas_pagamentos')
    recebimentos: Mapped[list['Recebimentos']] = relationship('Recebimentos', back_populates='formas_pagamentos')


class Fornecedor(Base):
    __tablename__ = 'fornecedor'
    __table_args__ = (
        PrimaryKeyConstraint('id_fornecedor', name='pk_fornecedor'),
        Index('sys_c009710', 'cnpj', unique=True)
    )

    id_fornecedor: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    cnpj: Mapped[str] = mapped_column(VARCHAR(14), nullable=False)
    razao_social: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    nome_fantasia: Mapped[Optional[str]] = mapped_column(VARCHAR(100))
    cnae_principal: Mapped[Optional[str]] = mapped_column(VARCHAR(7))
    natureza_juridica: Mapped[Optional[str]] = mapped_column(VARCHAR(4))
    endereco: Mapped[Optional[str]] = mapped_column(VARCHAR(200))
    cidade: Mapped[Optional[str]] = mapped_column(VARCHAR(100), nullable=False)
    cep: Mapped[Optional[str]] = mapped_column(VARCHAR(8))
    uf: Mapped[Optional[str]] = mapped_column(VARCHAR(2))
    email: Mapped[Optional[str]] = mapped_column(VARCHAR(100))
    telefone: Mapped[Optional[str]] = mapped_column(VARCHAR(15))
    whatsapp: Mapped[Optional[str]] = mapped_column(VARCHAR(15))
    data_atualizacao: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')
    data_cadastro: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('SYSDATE '))

    compras: Mapped[list['Compras']] = relationship('Compras', back_populates='fornecedor')
    contas_a_pagar: Mapped[list['ContasAPagar']] = relationship('ContasAPagar', back_populates='fornecedor')
    variacao_produtos: Mapped[list['VariacaoProdutos']] = relationship('VariacaoProdutos', back_populates='fornecedor')
    movimento_estoque: Mapped[list['MovimentoEstoque']] = relationship('MovimentoEstoque', back_populates='fornecedor')


class Maquininhas(Base):
    __tablename__ = 'maquininhas'
    __table_args__ = (
        PrimaryKeyConstraint('id_maquininha', name='pk_maquininhas'),
    )

    id_maquininha: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    nome_maquininha: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    taxa_credito_a_vista: Mapped[decimal.Decimal] = mapped_column(NUMBER(5, 2, True), nullable=False)
    taxa_debito: Mapped[decimal.Decimal] = mapped_column(NUMBER(5, 2, True), nullable=False)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')

    taxa_parcelamento: Mapped[list['TaxaParcelamento']] = relationship('TaxaParcelamento', back_populates='maquininhas')


class Usuarios(Base):
    __tablename__ = 'usuarios'
    __table_args__ = (
        PrimaryKeyConstraint('id_usuario', name='pk_usuarios'),
        Index('sys_c009744', 'email', unique=True)
    )

    id_usuario: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    nome: Mapped[str] = mapped_column(VARCHAR(150), nullable=False)
    email: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    funcao: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    data_criacao: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('SYSDATE '))
    data_status: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    ultimo_login: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')

    vendas: Mapped[list['Vendas']] = relationship('Vendas', back_populates='usuarios')


class Compras(Base):
    __tablename__ = 'compras'
    __table_args__ = (
        ForeignKeyConstraint(['id_fornecedor'], ['fornecedor.id_fornecedor'], name='fk_compras_fornecedor'),
        PrimaryKeyConstraint('id_compra', name='pk_compras'),
        Index('sys_c009717', 'chave_acesso_nfe', unique=True)
    )

    id_compra: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    data_compra: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('SYSDATE '))
    valor_total: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    status: Mapped[str] = mapped_column(VARCHAR(30), nullable=False)
    id_fornecedor: Mapped[int] = mapped_column(Integer, nullable=False)
    chave_acesso_nfe: Mapped[Optional[str]] = mapped_column(VARCHAR(44))
    nota_fiscal: Mapped[Optional[str]] = mapped_column(VARCHAR(20))
    ncm: Mapped[Optional[str]] = mapped_column(VARCHAR(8))
    cest_cst: Mapped[Optional[str]] = mapped_column(VARCHAR(7))
    icms: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True))
    pis: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True))
    icms_st: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True))
    diferencial_aliquota: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True))

    fornecedor: Mapped['Fornecedor'] = relationship('Fornecedor', back_populates='compras')
    contas_a_pagar: Mapped[list['ContasAPagar']] = relationship('ContasAPagar', back_populates='compras')
    itens_compra: Mapped[list['ItensCompra']] = relationship('ItensCompra', back_populates='compras')


class Produtos(Base):
    __tablename__ = 'produtos'
    __table_args__ = (
        ForeignKeyConstraint(['id_categoria_produto'], ['categoria_produtos.id_categoria'], name='fk_produtos_categoria'),
        PrimaryKeyConstraint('id_produto', name='pk_produtos')
    )

    id_produto: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    nome_produto: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    gestao: Mapped[str] = mapped_column(VARCHAR(50), nullable=False)
    id_categoria_produto: Mapped[int] = mapped_column(Integer, nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(VARCHAR(250))
    marca: Mapped[Optional[str]] = mapped_column(VARCHAR(50))
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')

    categoria_produtos: Mapped['CategoriaProdutos'] = relationship('CategoriaProdutos', back_populates='produtos')
    variacao_produtos: Mapped[list['VariacaoProdutos']] = relationship('VariacaoProdutos', back_populates='produtos')


class TaxaParcelamento(Base):
    __tablename__ = 'taxa_parcelamento'
    __table_args__ = (
        ForeignKeyConstraint(['id_maquininha'], ['maquininhas.id_maquininha'], name='fk_taxa_parc_maquininhas'),
        PrimaryKeyConstraint('id_taxa', name='pk_taxa_parcelamento')
    )

    id_taxa: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    numero_parcelas: Mapped[int] = mapped_column(Integer, nullable=False)
    taxa: Mapped[decimal.Decimal] = mapped_column(NUMBER(5, 2, True), nullable=False)
    id_maquininha: Mapped[int] = mapped_column(Integer, nullable=False)

    maquininhas: Mapped['Maquininhas'] = relationship('Maquininhas', back_populates='taxa_parcelamento')


class Vendas(Base):
    __tablename__ = 'vendas'
    __table_args__ = (
        ForeignKeyConstraint(['id_cliente'], ['clientes.id_cliente'], name='fk_vendas_clientes'),
        ForeignKeyConstraint(['id_usuario'], ['usuarios.id_usuario'], name='fk_vendas_usuarios'),
        PrimaryKeyConstraint('id_venda', name='pk_vendas')
    )

    id_venda: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    data_venda: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('SYSDATE '))
    valor_total: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False)
    id_cliente: Mapped[int] = mapped_column(Integer, nullable=False)
    id_usuario: Mapped[int] = mapped_column(Integer, nullable=False)

    clientes: Mapped['Clientes'] = relationship('Clientes', back_populates='vendas')
    usuarios: Mapped['Usuarios'] = relationship('Usuarios', back_populates='vendas')
    contas_a_receber: Mapped[list['ContasAReceber']] = relationship('ContasAReceber', back_populates='vendas')
    itens_venda: Mapped[list['ItensVenda']] = relationship('ItensVenda', back_populates='vendas')


class ContasAPagar(Base):
    __tablename__ = 'contas_a_pagar'
    __table_args__ = (
        ForeignKeyConstraint(['id_compra'], ['compras.id_compra'], name='fk_ct_pagar_compras'),
        ForeignKeyConstraint(['id_fornecedor'], ['fornecedor.id_fornecedor'], name='fk_ct_pagar_fornecedor'),
        PrimaryKeyConstraint('id_cta_a_pgto', name='pk_contas_a_pagar')
    )

    id_cta_a_pgto: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    num_parcelas: Mapped[int] = mapped_column(Integer, nullable=False)
    data_emissao: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    data_vencimento: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    valor_original: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    saldo_devedor: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    status_conta: Mapped[str] = mapped_column(VARCHAR(30), nullable=False)
    id_compra: Mapped[int] = mapped_column(Integer, nullable=False)
    id_fornecedor: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_pago: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))

    compras: Mapped['Compras'] = relationship('Compras', back_populates='contas_a_pagar')
    fornecedor: Mapped['Fornecedor'] = relationship('Fornecedor', back_populates='contas_a_pagar')
    pagamentos: Mapped[list['Pagamentos']] = relationship('Pagamentos', back_populates='contas_a_pagar')


class ContasAReceber(Base):
    __tablename__ = 'contas_a_receber'
    __table_args__ = (
        ForeignKeyConstraint(['id_cliente'], ['clientes.id_cliente'], name='fk_ct_receber_clientes'),
        ForeignKeyConstraint(['id_venda'], ['vendas.id_venda'], name='fk_ct_receber_vendas'),
        PrimaryKeyConstraint('id_cta_a_receber', name='pk_contas_a_receber')
    )

    id_cta_a_receber: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    numero_parcela: Mapped[int] = mapped_column(Integer, nullable=False)
    data_emissao: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    data_vencimento: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    valor_original: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    saldo_devedor: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    status_conta: Mapped[str] = mapped_column(VARCHAR(15), nullable=False)
    id_venda: Mapped[int] = mapped_column(Integer, nullable=False)
    id_cliente: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_pago: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))

    clientes: Mapped['Clientes'] = relationship('Clientes', back_populates='contas_a_receber')
    vendas: Mapped['Vendas'] = relationship('Vendas', back_populates='contas_a_receber')
    recebimentos: Mapped[list['Recebimentos']] = relationship('Recebimentos', back_populates='contas_a_receber')


class VariacaoProdutos(Base):
    __tablename__ = 'variacao_produtos'
    __table_args__ = (
        ForeignKeyConstraint(['id_fornecedor'], ['fornecedor.id_fornecedor'], name='fk_var_prod_fornecedor'),
        ForeignKeyConstraint(['id_produto'], ['produtos.id_produto'], name='fk_var_prod_produtos'),
        PrimaryKeyConstraint('id_variacao', name='pk_variacao_produtos'),
        Index('sys_c009725', 'ean', unique=True),
        Index('sys_c009726', 'sku', unique=True)
    )

    id_variacao: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    sku: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    custo: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    preco_venda: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    estoque_atual: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0 '))
    id_produto: Mapped[int] = mapped_column(Integer, nullable=False)
    tamanho: Mapped[Optional[str]] = mapped_column(VARCHAR(10))
    cor: Mapped[Optional[str]] = mapped_column(VARCHAR(20))
    ean: Mapped[Optional[str]] = mapped_column(VARCHAR(13))
    margem: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(5, 2, True))
    id_fornecedor: Mapped[Optional[int]] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, server_default='Ativo')

    fornecedor: Mapped[Optional['Fornecedor']] = relationship('Fornecedor', back_populates='variacao_produtos')
    produtos: Mapped['Produtos'] = relationship('Produtos', back_populates='variacao_produtos')
    itens_compra: Mapped[list['ItensCompra']] = relationship('ItensCompra', back_populates='variacao_produtos')
    itens_venda: Mapped[list['ItensVenda']] = relationship('ItensVenda', back_populates='variacao_produtos')
    movimento_estoque: Mapped[list['MovimentoEstoque']] = relationship('MovimentoEstoque', back_populates='variacao_produtos')


class ItensCompra(Base):
    __tablename__ = 'itens_compra'
    __table_args__ = (
        ForeignKeyConstraint(['id_compra'], ['compras.id_compra'], name='fk_itens_compra_compras'),
        ForeignKeyConstraint(['id_variacao'], ['variacao_produtos.id_variacao'], name='fk_itens_compra_var_prod'),
        PrimaryKeyConstraint('id_item_compra', name='pk_itens_compra')
    )

    id_item_compra: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    custo_unitario: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    valor_total_item: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    id_compra: Mapped[int] = mapped_column(Integer, nullable=False)
    id_variacao: Mapped[int] = mapped_column(Integer, nullable=False)
    cfop: Mapped[Optional[str]] = mapped_column(VARCHAR(4))
    ncm: Mapped[Optional[str]] = mapped_column(VARCHAR(8))
    cest_cst: Mapped[Optional[str]] = mapped_column(VARCHAR(7))

    compras: Mapped['Compras'] = relationship('Compras', back_populates='itens_compra')
    variacao_produtos: Mapped['VariacaoProdutos'] = relationship('VariacaoProdutos', back_populates='itens_compra')


class ItensVenda(Base):
    __tablename__ = 'itens_venda'
    __table_args__ = (
        ForeignKeyConstraint(['id_variacao'], ['variacao_produtos.id_variacao'], name='fk_itens_venda_var_prod'),
        ForeignKeyConstraint(['id_venda'], ['vendas.id_venda'], name='fk_itens_venda_vendas'),
        PrimaryKeyConstraint('id_item_venda', name='pk_itens_venda')
    )

    id_item_venda: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    preco_unitario: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    subtotal: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    id_venda: Mapped[int] = mapped_column(Integer, nullable=False)
    id_variacao: Mapped[int] = mapped_column(Integer, nullable=False)
    desconto: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))

    variacao_produtos: Mapped['VariacaoProdutos'] = relationship('VariacaoProdutos', back_populates='itens_venda')
    vendas: Mapped['Vendas'] = relationship('Vendas', back_populates='itens_venda')


class MovimentoEstoque(Base):
    __tablename__ = 'movimento_estoque'
    __table_args__ = (
        ForeignKeyConstraint(['id_fornecedor'], ['fornecedor.id_fornecedor'], name='fk_mov_est_fornecedor'),
        ForeignKeyConstraint(['id_variacao'], ['variacao_produtos.id_variacao'], name='fk_mov_est_var_prod'),
        PrimaryKeyConstraint('id_movimento', name='pk_movimento_estoque')
    )

    id_movimento: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    tipo_movimento: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    quantidade: Mapped[int] = mapped_column(Integer, nullable=False)
    data_movimento: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False, server_default=text('SYSDATE '))
    id_variacao: Mapped[int] = mapped_column(Integer, nullable=False)
    referencia_movimento: Mapped[Optional[int]] = mapped_column(Integer)
    id_fornecedor: Mapped[Optional[int]] = mapped_column(Integer)

    fornecedor: Mapped[Optional['Fornecedor']] = relationship('Fornecedor', back_populates='movimento_estoque')
    variacao_produtos: Mapped['VariacaoProdutos'] = relationship('VariacaoProdutos', back_populates='movimento_estoque')


class Pagamentos(Base):
    __tablename__ = 'pagamentos'
    __table_args__ = (
        ForeignKeyConstraint(['id_cta_a_pgto'], ['contas_a_pagar.id_cta_a_pgto'], name='fk_pagamentos_ct_pagar'),
        ForeignKeyConstraint(['id_forma_pgto'], ['formas_pagamentos.id_forma_pgto'], name='fk_pagamentos_formas_pgto'),
        PrimaryKeyConstraint('id_pagamento', name='pk_pagamentos')
    )

    id_pagamento: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    data_pagamento: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    valor_pagamento: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    id_forma_pgto: Mapped[int] = mapped_column(Integer, nullable=False)
    id_cta_a_pgto: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_juros: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))
    valor_desconto: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))
    status: Mapped[Optional[str]] = mapped_column(VARCHAR(20), default='Efetivado') # Ex: Efetivado, Cancelado

    contas_a_pagar: Mapped['ContasAPagar'] = relationship('ContasAPagar', back_populates='pagamentos')
    formas_pagamentos: Mapped['FormasPagamentos'] = relationship('FormasPagamentos', back_populates='pagamentos')


class Recebimentos(Base):
    __tablename__ = 'recebimentos'
    __table_args__ = (
        ForeignKeyConstraint(['id_cta_a_receber'], ['contas_a_receber.id_cta_a_receber'], name='fk_recebimentos_ct_receber'),
        ForeignKeyConstraint(['id_forma_pgto'], ['formas_pagamentos.id_forma_pgto'], name='fk_recebimentos_formas_pgto'),
        PrimaryKeyConstraint('id_recebimento', name='pk_recebimentos')
    )

    id_recebimento: Mapped[int] = mapped_column(Integer, Identity(on_null=False, start=1, increment=1, minvalue=1, maxvalue=9999999999999999999999999999, cycle=False, cache=20, order=False), primary_key=True)
    data_pagamento: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    valor_pagamento: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    valor_liquido: Mapped[decimal.Decimal] = mapped_column(NUMBER(10, 2, True), nullable=False)
    id_cta_a_receber: Mapped[int] = mapped_column(Integer, nullable=False)
    id_forma_pgto: Mapped[int] = mapped_column(Integer, nullable=False)
    valor_juros: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))
    valor_desconto: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))
    valor_tx_maquininha: Mapped[Optional[decimal.Decimal]] = mapped_column(NUMBER(10, 2, True), server_default=text('0'))
    status: Mapped[Optional[str]] = mapped_column(VARCHAR(20), default='Efetivado') 

    contas_a_receber: Mapped['ContasAReceber'] = relationship('ContasAReceber', back_populates='recebimentos')
    formas_pagamentos: Mapped['FormasPagamentos'] = relationship('FormasPagamentos', back_populates='recebimentos')
