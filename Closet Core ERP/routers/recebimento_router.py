from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceRecebimento
from fastapi.encoders import jsonable_encoder

router = APIRouter()
TAGS = ["Recebimentos"]

@router.post("/recebimentos", status_code=201, tags=TAGS)
def registrar_recebimento_api(dados: dict, db: Session = Depends(get_db)):
    """
    Registra um novo recebimento para uma conta a receber de venda.
    """
    service = ServiceRecebimento(session=db)
    novo_recebimento = service.registrar_recebimento(dados)
    return jsonable_encoder(novo_recebimento)

@router.post("/recebimentos/{recebimento_id}/cancelar", tags=TAGS)
def cancelar_recebimento_api(recebimento_id: int, db: Session = Depends(get_db)):
    """
    Cancela/Estorna um recebimento de venda existente.
    """
    service = ServiceRecebimento(session=db)
    recebimento_cancelado = service.cancelar_recebimento(recebimento_id)
    return jsonable_encoder(recebimento_cancelado)

