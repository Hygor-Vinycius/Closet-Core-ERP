from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceCondicaoPagamento
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()
TAGS = ["Condições de Pagamento"]

@router.post("/condicoes-pagamento", status_code=201, tags=TAGS)
def cadastrar_condicao_pagamento_api(dados: dict, db: Session = Depends(get_db)):
    """Cria uma nova condição de pagamento."""
    service = ServiceCondicaoPagamento(session=db)
    nova_condicao = service.cadastrar_condicao_pagamento(dados)
    return jsonable_encoder(nova_condicao)

@router.get("/condicoes-pagamento", tags=TAGS)
def listar_condicoes_pagamento_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """Lista as condições de pagamento, com busca opcional por descrição."""
    service = ServiceCondicaoPagamento(session=db)
    status_final = None if status and status.lower() == 'todos' else status.title()
    lista = service.listar_condicoes_pagamento(descricao=search, status=status_final)
    return jsonable_encoder(lista)

@router.get("/condicoes-pagamento/{condicao_id}", tags=TAGS)
def obter_condicao_pagamento_api(condicao_id: int, db: Session = Depends(get_db)):
    """Busca uma condição de pagamento específica pelo seu ID."""
    service = ServiceCondicaoPagamento(session=db)
    condicao = service.get_by_id(condicao_id) # Método herdado!
    return jsonable_encoder(condicao)

@router.put("/condicoes-pagamento/{condicao_id}", tags=TAGS)
def atualizar_condicao_pagamento_api(condicao_id: int, dados: dict, db: Session = Depends(get_db)):
    """Atualiza os dados de uma condição de pagamento existente."""
    service = ServiceCondicaoPagamento(session=db)
    condicao = service.update(condicao_id, dados) # Método herdado!
    return jsonable_encoder(condicao)

@router.delete("/condicoes-pagamento/{condicao_id}", tags=TAGS)
def inativar_condicao_pagamento_api(condicao_id: int, db: Session = Depends(get_db)):
    """Inativa uma condição de pagamento existente (Soft Delete)."""
    service = ServiceCondicaoPagamento(session=db)
    service.inativar(condicao_id) # Método herdado!
    return {"detail": "Condição de pagamento inativada com sucesso"}