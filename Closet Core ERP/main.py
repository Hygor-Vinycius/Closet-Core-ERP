import os
import sys
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

# Importação de rotas (Mantenha todas as suas rotas aqui)
from routers import (
    cliente_router, fornecedor_router, usuario_router, empresa_router,
    categoria_produtos_routers, produto_router, variacao_produtos_router,
    formas_pagamentos_routers, condicao_pagamento_routers, maquininhas_router,
    taxa_parcelamento_router, venda_router, compra_router, pagamento_router,
    recebimento_router, contas_a_pagar_router, contas_a_receber_router,
    dashboard_router
)

app = FastAPI()

# CORS (Pode manter, embora localmente não seja estritamente necessário se servido junto)
origins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. INCLUIR ROTAS DA API ---
# (Prefixo /api é uma boa prática, mas vamos manter na raiz para não quebrar seu front atual)
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
app.include_router(contas_a_pagar_router.router)
app.include_router(contas_a_receber_router.router)
app.include_router(dashboard_router.router)

# --- 2. SERVIR O FRONTEND (REACT) ---
# Verifica se estamos rodando como script ou como exe congelado
if getattr(sys, 'frozen', False):
    # Se for .exe, a pasta dist estará junto do executável
    dist_path = os.path.join(sys._MEIPASS, "dist")
else:
    # Se for script, a pasta dist está na raiz
    dist_path = "dist"

if os.path.exists(dist_path):
    # Monta os arquivos estáticos (CSS, JS, Imagens)
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    # Rota para servir o index.html em qualquer outra rota (para o React Router funcionar)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Se a rota começar com api/ ou docs, deixa o FastAPI tratar (retorna 404 se não achar)
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
        
        # Para qualquer outra coisa, retorna o index.html do React
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    print("AVISO: Pasta 'dist' não encontrada. O Frontend não será servido.")

# --- 3. PONTO DE ENTRADA PARA O EXE ---
if __name__ == "__main__":
    import uvicorn
    import multiprocessing
    import traceback # Para imprimir o erro detalhado
    
    # Necessário para PyInstaller no Windows
    multiprocessing.freeze_support()
    
    # Abre o navegador automaticamente
    import webbrowser
    from threading import Timer
    
    def open_browser():
        # Tenta conectar por 1.5 segundos antes de abrir
        webbrowser.open("http://localhost:8000")

    try:
        print("Iniciando Closet Core ERP...")
        print("Por favor, não feche esta janela enquanto usar o sistema.")
        
        Timer(2.0, open_browser).start()
        
        # Roda o servidor
        # log_level="error" reduz a sujeira na tela, mostrando só o importante
        uvicorn.run(app, host="0.0.0.0", port=8000, workers=1, log_level="info")

    except Exception as e:
        # SE OCORRER QUALQUER ERRO, O CÓDIGO CAI AQUI
        print("\n" + "="*60)
        print("ERRO FATAL: O sistema não conseguiu iniciar.")
        print("="*60)
        print(traceback.format_exc()) # Imprime o erro técnico
        print("="*60)
        # Esta linha impede a janela de fechar!
        input("Pressione ENTER para sair...")