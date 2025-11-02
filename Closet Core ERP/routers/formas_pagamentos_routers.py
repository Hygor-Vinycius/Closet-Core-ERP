from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceFormasPagamentos
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()
TAGS = ["Formas de Pagamento"]

@router.post("/formas-pagamento", status_code=201, tags=TAGS)
def cadastrar_forma_pagamento_api(dados: dict, db: Session = Depends(get_db)):
    """Cria uma nova forma de pagamento."""
    service = ServiceFormasPagamentos(session=db)
    nova_forma_pagamento = service.cadastrar_forma_pagamento(dados)
    return jsonable_encoder(nova_forma_pagamento)

@router.get("/formas-pagamento", tags=TAGS)
def listar_formas_pagamento_api(search: Optional[str] = None, status: Optional[str] = "Ativo", db: Session = Depends(get_db)):
    """Lista as formas de pagamento, com busca opcional por descrição."""
    service = ServiceFormasPagamentos(session=db)
    status_final = None if status and status.lower() == 'todos' else status.title()
    lista = service.listar_formas_pagamento(descricao=search, status=status_final)
    return jsonable_encoder(lista)

@router.get("/formas-pagamento/{forma_pagamento_id}", tags=TAGS)
def obter_forma_pagamento_api(forma_pagamento_id: int, db: Session = Depends(get_db)):
    """Busca uma forma de pagamento específica pelo seu ID."""
    service = ServiceFormasPagamentos(session=db)
    forma_pagamento = service.get_by_id(forma_pagamento_id) # Método herdado!
    return jsonable_encoder(forma_pagamento)

@router.put("/formas-pagamento/{forma_pagamento_id}", tags=TAGS)
def atualizar_forma_pagamento_api(forma_pagamento_id: int, dados: dict, db: Session = Depends(get_db)):
    """Atualiza os dados de uma forma de pagamento existente."""
    service = ServiceFormasPagamentos(session=db)
    forma_pagamento = service.update(forma_pagamento_id, dados) # Método herdado!
    return jsonable_encoder(forma_pagamento)

@router.delete("/formas-pagamento/{forma_pagamento_id}", tags=TAGS)
def inativar_forma_pagamento_api(forma_pagamento_id: int, db: Session = Depends(get_db)):
    """Inativa uma forma de pagamento existente (Soft Delete)."""
    service = ServiceFormasPagamentos(session=db)
    service.inativar(forma_pagamento_id) # Método herdado!
    return {"detail": "Forma de pagamento inativada com sucesso"}