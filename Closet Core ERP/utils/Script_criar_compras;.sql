SET SERVEROUTPUT ON;
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD';

DECLARE
    -- Variáveis para capturar os IDs gerados
    v_id_compra       compras.id_compra%TYPE;
    
    -- Variáveis para definir os dados da compra
    v_id_fornecedor   fornecedor.id_fornecedor%TYPE;
    v_total_compra    compras.valor_total%TYPE;
    v_data_compra     DATE;
    v_nota_fiscal     compras.nota_fiscal%TYPE;

BEGIN
    DBMS_OUTPUT.PUT_LINE('--- Iniciando Inserção de 20 Novas Compras ---');

    -- ====================================================================
    -- COMPRA 16 (NF-2016): Fornecedor 90, 2 itens, 2 parcelas
    -- Itens: 10x Var 91 (82.5), 20x Var 83 (69.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 90;
        v_data_compra   := TO_DATE('2025-11-24', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2016';
        v_total_compra  := (10 * 82.5) + (20 * 69.9); -- 825 + 1398 = 2223.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (10, 82.50, (10 * 82.50), v_id_compra, 91);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (20, 69.90, (20 * 69.90), v_id_compra, 83);
        
        -- Parcelas (2x 1111.50)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 1111.50, 1111.50, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 1111.50, 1111.50, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 10, v_data_compra, v_id_compra, v_id_fornecedor, 91);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 20, v_data_compra, v_id_compra, v_id_fornecedor, 83);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 10, custo = 82.50 WHERE id_variacao = 91;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 20, custo = 69.90 WHERE id_variacao = 83;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 17 (NF-2017): Fornecedor 81, 2 itens, 1 parcela
    -- Itens: 5x Var 87 (99.9), 10x Var 82 (79.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 81;
        v_data_compra   := TO_DATE('2025-11-24', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2017';
        v_total_compra  := (5 * 99.9) + (10 * 79.9); -- 499.5 + 799 = 1298.50
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (5, 99.90, (5 * 99.90), v_id_compra, 87);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (10, 79.90, (10 * 79.90), v_id_compra, 82);
        
        -- Parcelas (1x 1298.50)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 1298.50, 1298.50, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 5, v_data_compra, v_id_compra, v_id_fornecedor, 87);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 10, v_data_compra, v_id_compra, v_id_fornecedor, 82);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 5, custo = 99.90 WHERE id_variacao = 87;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 10, custo = 79.90 WHERE id_variacao = 82;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 18 (NF-2018): Fornecedor 3, 1 item, 1 parcela
    -- Item: 100x Var 21 (25.0)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 3;
        v_data_compra   := TO_DATE('2025-11-25', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2018';
        v_total_compra  := (100 * 25.0); -- 2500.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (100, 25.00, v_total_compra, v_id_compra, 21);
        
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, v_total_compra, v_total_compra, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 100, v_data_compra, v_id_compra, v_id_fornecedor, 21);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 100, custo = 25.00 WHERE id_variacao = 21;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 19 (NF-2019): Fornecedor 21, 1 item, 2 parcelas
    -- Item: 200x Var 1 (39.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 21;
        v_data_compra   := TO_DATE('2025-11-26', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2019';
        v_total_compra  := (200 * 39.9); -- 7980.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (200, 39.90, v_total_compra, v_id_compra, 1);
        
        -- 2 parcelas de 3990.00
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 3990.00, 3990.00, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 3990.00, 3990.00, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 200, v_data_compra, v_id_compra, v_id_fornecedor, 1);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 200, custo = 39.90 WHERE id_variacao = 1;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 20 (NF-2020): Fornecedor 85, 1 item, 1 parcela
    -- Item: 50x Var 86 (85.0)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 85;
        v_data_compra   := TO_DATE('2025-11-27', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2020';
        v_total_compra  := (50 * 85.0); -- 4250.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (50, 85.00, v_total_compra, v_id_compra, 86);
        
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, v_total_compra, v_total_compra, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 50, v_data_compra, v_id_compra, v_id_fornecedor, 86);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 50, custo = 85.00 WHERE id_variacao = 86;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 21 (NF-2021): Fornecedor 87, 2 itens, 3 parcelas
    -- Itens: 50x Var 85 (39.9), 10x Var 87 (99.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 87;
        v_data_compra   := TO_DATE('2025-11-28', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2021';
        v_total_compra  := (50 * 39.9) + (10 * 99.9); -- 1995 + 999 = 2994.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (50, 39.90, (50 * 39.90), v_id_compra, 85);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (10, 99.90, (10 * 99.90), v_id_compra, 87);
        
        -- Parcelas (3x 998.00)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 998.00, 998.00, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 998.00, 998.00, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (3, v_data_compra, v_data_compra + 90, 998.00, 998.00, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 50, v_data_compra, v_id_compra, v_id_fornecedor, 85);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 10, v_data_compra, v_id_compra, v_id_fornecedor, 87);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 50, custo = 39.90 WHERE id_variacao = 85;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 10, custo = 99.90 WHERE id_variacao = 87;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 22 (NF-2022): Fornecedor 61, 2 itens, 1 parcela
    -- Itens: 20x Var 46 (69.9), 10x Var 62 (59.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 61;
        v_data_compra   := TO_DATE('2025-11-29', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2022';
        v_total_compra  := (20 * 69.9) + (10 * 59.9); -- 1398 + 599 = 1997.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (20, 69.90, (20 * 69.90), v_id_compra, 46);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (10, 59.90, (10 * 59.90), v_id_compra, 62);
        
        -- Parcelas (1x 1997.00)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 1997.00, 1997.00, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 20, v_data_compra, v_id_compra, v_id_fornecedor, 46);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 10, v_data_compra, v_id_compra, v_id_fornecedor, 62);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 20, custo = 69.90 WHERE id_variacao = 46;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 10, custo = 59.90 WHERE id_variacao = 62;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 23 (NF-2023): Fornecedor 83, 1 item, 2 parcelas
    -- Item: 30x Var 83 (69.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 83;
        v_data_compra   := TO_DATE('2025-11-30', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2023';
        v_total_compra  := (30 * 69.9); -- 2097.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (30, 69.90, v_total_compra, v_id_compra, 83);
        
        -- 2 parcelas de 1048.50
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 1048.50, 1048.50, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 1048.50, 1048.50, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 30, v_data_compra, v_id_compra, v_id_fornecedor, 83);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 30, custo = 69.90 WHERE id_variacao = 83;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 24 (NF-2024): Fornecedor 89, 1 item, 1 parcela
    -- Item: 60x Var 89 (49.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 89;
        v_data_compra   := TO_DATE('2025-12-01', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2024';
        v_total_compra  := (60 * 49.9); -- 2994.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (60, 49.90, v_total_compra, v_id_compra, 89);
        
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, v_total_compra, v_total_compra, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 60, v_data_compra, v_id_compra, v_id_fornecedor, 89);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 60, custo = 49.90 WHERE id_variacao = 89;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 25 (NF-2025): Fornecedor 88, 2 itens, 2 parcelas
    -- Itens: 20x Var 90 (75.0), 30x Var 86 (85.0)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 88;
        v_data_compra   := TO_DATE('2025-12-02', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2025';
        v_total_compra  := (20 * 75.0) + (30 * 85.0); -- 1500 + 2550 = 4050.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (20, 75.00, (20 * 75.00), v_id_compra, 90);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (30, 85.00, (30 * 85.00), v_id_compra, 86);
        
        -- Parcelas (2x 2025.00)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 2025.00, 2025.00, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 2025.00, 2025.00, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 20, v_data_compra, v_id_compra, v_id_fornecedor, 90);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 30, v_data_compra, v_id_compra, v_id_fornecedor, 86);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 20, custo = 75.00 WHERE id_variacao = 90;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 30, custo = 85.00 WHERE id_variacao = 86;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 26 (NF-2026): Fornecedor 84, 1 item, 3 parcelas
    -- Item: 40x Var 84 (59.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 84;
        v_data_compra   := TO_DATE('2025-12-03', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2026';
        v_total_compra  := (40 * 59.9); -- 2396.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (40, 59.90, v_total_compra, v_id_compra, 84);
        
        -- 3 parcelas (2x 798.67, 1x 798.66)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 798.67, 798.67, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 798.67, 798.67, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (3, v_data_compra, v_data_compra + 90, 798.66, 798.66, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 40, v_data_compra, v_id_compra, v_id_fornecedor, 84);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 40, custo = 59.90 WHERE id_variacao = 84;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 27 (NF-2027): Fornecedor 82, 1 item, 1 parcela
    -- Item: 70x Var 63 (62.5)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 82;
        v_data_compra   := TO_DATE('2025-12-04', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2027';
        v_total_compra  := (70 * 62.5); -- 4375.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (70, 62.50, v_total_compra, v_id_compra, 63);
        
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, v_total_compra, v_total_compra, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 70, v_data_compra, v_id_compra, v_id_fornecedor, 63);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 70, custo = 62.50 WHERE id_variacao = 63;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 28 (NF-2028): Fornecedor 3, 2 itens, 2 parcelas
    -- Itens: 30x Var 2 (100.0), 50x Var 3 (39.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 3;
        v_data_compra   := TO_DATE('2025-12-05', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2028';
        v_total_compra  := (30 * 100.0) + (50 * 39.9); -- 3000 + 1995 = 4995.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (30, 100.00, (30 * 100.00), v_id_compra, 2);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (50, 39.90, (50 * 39.90), v_id_compra, 3);
        
        -- Parcelas (2x 2497.50)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 2497.50, 2497.50, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 2497.50, 2497.50, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 30, v_data_compra, v_id_compra, v_id_fornecedor, 2);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 50, v_data_compra, v_id_compra, v_id_fornecedor, 3);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 30, custo = 100.00 WHERE id_variacao = 2;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 50, custo = 39.90 WHERE id_variacao = 3;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 29 (NF-2029): Fornecedor 61, 1 item, 3 parcelas
    -- Item: 15x Var 62 (59.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 61;
        v_data_compra   := TO_DATE('2025-12-06', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2029';
        v_total_compra  := (15 * 59.9); -- 898.50
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (15, 59.90, v_total_compra, v_id_compra, 62);
        
        -- 3 parcelas de 299.50
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 299.50, 299.50, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 299.50, 299.50, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (3, v_data_compra, v_data_compra + 90, 299.50, 299.50, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 15, v_data_compra, v_id_compra, v_id_fornecedor, 62);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 15, custo = 59.90 WHERE id_variacao = 62;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 30 (NF-2030): Fornecedor 86, 2 itens, 1 parcela
    -- Itens: 20x Var 88 (110.0), 30x Var 84 (59.9) - Forn 84
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 86;
        v_data_compra   := TO_DATE('2025-12-07', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2030';
        v_total_compra  := (20 * 110.0) + (30 * 59.9); -- 2200 + 1797 = 3997.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (20, 110.00, (20 * 110.00), v_id_compra, 88);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (30, 59.90, (30 * 59.90), v_id_compra, 84);
        
        -- Parcelas (1x 3997.00)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 3997.00, 3997.00, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 20, v_data_compra, v_id_compra, v_id_fornecedor, 88);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 30, v_data_compra, v_id_compra, v_id_fornecedor, 84);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 20, custo = 110.00 WHERE id_variacao = 88;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 30, custo = 59.90 WHERE id_variacao = 84;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 31 (NF-2031): Fornecedor 90, 1 item, 2 parcelas
    -- Item: 40x Var 91 (82.5)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 90;
        v_data_compra   := TO_DATE('2025-12-08', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2031';
        v_total_compra  := (40 * 82.5); -- 3300.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (40, 82.50, v_total_compra, v_id_compra, 91);
        
        -- 2 parcelas de 1650.00
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 1650.00, 1650.00, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 1650.00, 1650.00, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 40, v_data_compra, v_id_compra, v_id_fornecedor, 91);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 40, custo = 82.50 WHERE id_variacao = 91;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 32 (NF-2032): Fornecedor 81, 1 item, 1 parcela
    -- Item: 25x Var 87 (99.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 81;
        v_data_compra   := TO_DATE('2025-12-09', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2032';
        v_total_compra  := (25 * 99.9); -- 2497.50
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (25, 99.90, v_total_compra, v_id_compra, 87);
        
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, v_total_compra, v_total_compra, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 25, v_data_compra, v_id_compra, v_id_fornecedor, 87);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 25, custo = 99.90 WHERE id_variacao = 87;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 33 (NF-2033): Fornecedor 85, 1 item, 2 parcelas
    -- Item: 15x Var 86 (85.0)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 85;
        v_data_compra   := TO_DATE('2025-12-10', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2033';
        v_total_compra  := (15 * 85.0); -- 1275.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (15, 85.00, v_total_compra, v_id_compra, 86);
        
        -- 2 parcelas de 637.50
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 637.50, 637.50, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 637.50, 637.50, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 15, v_data_compra, v_id_compra, v_id_fornecedor, 86);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 15, custo = 85.00 WHERE id_variacao = 86;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 34 (NF-2034): Fornecedor 87, 1 item, 3 parcelas
    -- Item: 80x Var 85 (39.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 87;
        v_data_compra   := TO_DATE('2025-12-11', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2034';
        v_total_compra  := (80 * 39.9); -- 3192.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;
        
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (80, 39.90, v_total_compra, v_id_compra, 85);
        
        -- 3 parcelas de 1064.00
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 1064.00, 1064.00, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (2, v_data_compra, v_data_compra + 60, 1064.00, 1064.00, 'Aberto', v_id_compra, v_id_fornecedor);
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (3, v_data_compra, v_data_compra + 90, 1064.00, 1064.00, 'Aberto', v_id_compra, v_id_fornecedor);
        
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 80, v_data_compra, v_id_compra, v_id_fornecedor, 85);
        
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 80, custo = 39.90 WHERE id_variacao = 85;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;

    -- ====================================================================
    -- COMPRA 35 (NF-2035): Fornecedor 61, 3 itens, 1 parcela
    -- Itens: 10x Var 46 (69.9), 10x Var 61 (59.9), 10x Var 62 (59.9)
    -- ====================================================================
    BEGIN
        v_id_fornecedor := 61;
        v_data_compra   := TO_DATE('2025-12-12', 'YYYY-MM-DD');
        v_nota_fiscal   := 'NF-2035';
        v_total_compra  := (10 * 69.9) + (10 * 59.9) + (10 * 59.9); -- 699 + 599 + 599 = 1897.00
        
        INSERT INTO compras (data_compra, valor_total, nota_fiscal, status, id_fornecedor)
        VALUES (v_data_compra, v_total_compra, v_nota_fiscal, 'Recebida', v_id_fornecedor)
        RETURNING id_compra INTO v_id_compra;

        -- Itens
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (10, 69.90, (10 * 69.90), v_id_compra, 46);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (10, 59.90, (10 * 59.90), v_id_compra, 61);
        INSERT INTO itens_compra (quantidade, custo_unitario, valor_total_item, id_compra, id_variacao)
        VALUES (10, 59.90, (10 * 59.90), v_id_compra, 62);
        
        -- Parcelas (1x 1897.00)
        INSERT INTO contas_a_pagar (num_parcelas, data_emissao, data_vencimento, valor_original, saldo_devedor, status_conta, id_compra, id_fornecedor)
        VALUES (1, v_data_compra, v_data_compra + 30, 1897.00, 1897.00, 'Aberto', v_id_compra, v_id_fornecedor);

        -- Movimentos
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 10, v_data_compra, v_id_compra, v_id_fornecedor, 46);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 10, v_data_compra, v_id_compra, v_id_fornecedor, 61);
        INSERT INTO movimento_estoque (tipo_movimento, quantidade, data_movimento, referencia_movimento, id_fornecedor, id_variacao)
        VALUES ('ENTRADA POR COMPRA', 10, v_data_compra, v_id_compra, v_id_fornecedor, 62);
        
        -- Estoque/Custo Update
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 10, custo = 69.90 WHERE id_variacao = 46;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 10, custo = 59.90 WHERE id_variacao = 61;
        UPDATE variacao_produtos SET estoque_atual = estoque_atual + 10, custo = 59.90 WHERE id_variacao = 62;
        
        DBMS_OUTPUT.PUT_LINE('Compra ' || v_nota_fiscal || ' (ID: ' || v_id_compra || ') inserida.');
    END;


    -- Se tudo deu certo, commita
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('--- 20 novas compras inseridas com sucesso! ---');

EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, desfaz tudo
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Erro ao inserir compras: ' || SQLERRM);
        DBMS_OUTPUT.PUT_LINE('ROLLBACK EXECUTADO. NENHUMA COMPRA FOI SALVA.');
END;
/