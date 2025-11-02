# Em routers/taxa_parcelamento_router.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services import ServiceTaxaParcelamento
from fastapi.encoders import jsonable_encoder
from typing import Optional

router = APIRouter()
TAGS = ["Taxas de Parcelamento"]

@router.post("/taxas-parcelamento", status_code=201, tags=TAGS)
def cadastrar_taxa_api(dados: dict, db: Session = Depends(get_db)):
    """Cria uma nova taxa de parcelamento."""
    service = ServiceTaxaParcelamento(session=db)
    nova_taxa = service.cadastrar_taxa(dados)
    return jsonable_encoder(nova_taxa)

@router.get("/taxas-parcelamento", tags=TAGS)
def listar_taxas_api(maquininha_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Lista as taxas de parcelamento, com filtro opcional por ID da maquininha."""
    service = ServiceTaxaParcelamento(session=db)
    lista = service.listar_taxas(maquininha_id=maquininha_id)
    return jsonable_encoder(lista)

@router.get("/taxas-parcelamento/{taxa_id}", tags=TAGS)
def obter_taxa_api(taxa_id: int, db: Session = Depends(get_db)):
    """Busca uma taxa de parcelamento específica pelo seu ID."""
    service = ServiceTaxaParcelamento(session=db)
    taxa = service.get_by_id(taxa_id) # Método herdado!
    return jsonable_encoder(taxa)

@router.put("/taxas-parcelamento/{taxa_id}", tags=TAGS)
def atualizar_taxa_api(taxa_id: int, dados: dict, db: Session = Depends(get_db)):
    """Atualiza os dados de uma taxa de parcelamento existente."""
    service = ServiceTaxaParcelamento(session=db)
    taxa = service.update(taxa_id, dados) # Método herdado!
    return jsonable_encoder(taxa)

@router.delete("/taxas-parcelamento/{taxa_id}", tags=TAGS)
def deletar_taxa_api(taxa_id: int, db: Session = Depends(get_db)):
    """Exclui fisicamente uma taxa de parcelamento (Hard Delete)."""
    service = ServiceTaxaParcelamento(session=db)
    service.deletar(taxa_id) # Chama o método de exclusão física
    return {"detail": "Taxa de parcelamento deletada com sucesso"}