# Em: main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <-- 1. IMPORTE O CORS

# 1. Importação de rotas:
from routers import cliente_router
from routers import fornecedor_router
from routers import usuario_router
from routers import empresa_router
from routers import categoria_produtos_routers
from routers import produto_router
from routers import variacao_produtos_router
from routers import formas_pagamentos_routers
from routers import condicao_pagamento_routers
from routers import maquininhas_router
from routers import taxa_parcelamento_router
from routers import venda_router
from routers import compra_router
from routers import pagamento_router
from routers import recebimento_router
# (Seu main.py estava faltando o import do contas_a_pagar_router que fizemos)
from routers import contas_a_pagar_router 

app = FastAPI()

# --- 🚀 CÓDIGO DE CORREÇÃO (CORS) 🚀 ---
# 2. ADICIONE ESTE BLOCO INTEIRO
origins = [
    "http://localhost:5173", # Endereço padrão do seu frontend React/Vite
    "http://localhost:3000", # Outro endereço comum do React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # Permite que ESTAS origens acessem sua API
    allow_credentials=True,
    allow_methods=["*"],     # Permite todos os métodos (GET, POST, PUT, etc.)
    allow_headers=["*"],     # Permite todos os cabeçalhos
)
# --- FIM DO BLOCO CORS ---


# Router de cada arquivo:
app.include_router(cliente_router.router)
app.include_router(fornecedor_router.router)
app.include_router(usuario_router.router)
app.include_router(empresa_router.router)
app.include_router(categoria_produtos_routers.router)
app.include_router(produto_router.router)
app.include_router(variacao_produtos_router.router)
app.include_router(formas_pagamentos_routers.router)
app.include_router(condicao_pagamento_routers.router)
app.include_router(maquininhas_router.router)
app.include_router(taxa_parcelamento_router.router)
app.include_router(venda_router.router)
app.include_router(compra_router.router)
app.include_router(pagamento_router.router)
app.include_router(recebimento_router.router)
app.include_router(contas_a_pagar_router.router) # <-- 3. ADICIONE ESTA LINHA