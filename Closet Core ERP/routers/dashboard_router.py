from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.dashboard_service import ServiceDashboard

router = APIRouter()

@router.get("/dashboard/resumo", tags=["Dashboard"])
def obter_resumo_dashboard(db: Session = Depends(get_db)):
    """Retorna os KPIs e dados para o Dashboard Executivo."""
    service = ServiceDashboard(session=db)
    return service.obter_dados_completos()