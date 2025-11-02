# Dicas do Projeto Closet Core ERP

Este arquivo contém anotações importantes para o desenvolvimento.

## Gerenciamento de Dependências

* **Ambiente Virtual:** Sempre ative o ambiente virtual (`venv`) antes de instalar qualquer biblioteca.
  - **Windows:** `.\venv\Scripts\activate`

* **Arquivo `requirements.txt`:** Use este arquivo para gerenciar as dependências do projeto.
  - Para instalar: `pip install -r requirements.txt`
  - Para adicionar uma nova biblioteca:
    1. Instale: `pip install nova-biblioteca`
    2. Atualize o arquivo: `pip freeze > requirements.txt`

## Execução do servidor da API para testes com Insomnia

  - Para executar a aplicação: `uvicorn main:app`
  - Para reiniciar a aplicação: `uvicorn main:app --reload`

## Conexão com o Banco de Dados


---

_Última atualização: 20 de Setembro de 2025_