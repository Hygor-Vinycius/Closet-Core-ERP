from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServicePagamento
from fastapi.encoders import jsonable_encoder

router = APIRouter()
TAGS = ["Pagamentos"]

@router.post("/pagamentos", status_code=201, tags=TAGS)
def registrar_pagamento_api(dados: dict, db: Session = Depends(get_db)):
    """
    Registra um novo pagamento para uma conta a pagar de compra.
    
    Exemplo JSON:
    {
        "id_cta_a_pgto": 15,
        "valor_pagamento": 50.00,
        "data_pagamento": "2025-11-23",
        "id_forma_pgto": 1,
        "valor_juros": 0.00,
        "valor_desconto": 0.00 
    }
    """
    service = ServicePagamento(session=db)
    novo_pagamento = service.registrar_pagamento(dados)
    return jsonable_encoder(novo_pagamento)

@router.post("/pagamentos/{pagamento_id}/cancelar", tags=TAGS)
def cancelar_pagamento_api(pagamento_id: int, db: Session = Depends(get_db)):
    """
    Cancela/Estorna um pagamento de compra existente.
    """
    service = ServicePagamento(session=db)
    pagamento_cancelado = service.cancelar_pagamento(pagamento_id)
    return jsonable_encoder(pagamento_cancelado)

@router.get("/pagamentos/por-conta/{id_cta_a_pgto}", tags=TAGS)
def listar_pagamentos_por_conta_api(id_cta_a_pgto: int, db: Session = Depends(get_db)):
    """
    Lista todos os pagamentos (efetivados e cancelados) de uma conta a pagar específica.
    """
    service = ServicePagamento(session=db)
    pagamentos = service.listar_por_conta(id_cta_a_pgto)
    return jsonable_encoder(pagamentos)