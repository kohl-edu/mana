# Configuração do Um Tempo com Deus

A versão 2 usa Supabase para autenticação e sincronização dos registros.

## 1. Criar o projeto

Crie um projeto no Supabase e abra o SQL Editor.

## 2. Criar as tabelas

Cole e execute o conteúdo de:

supabase/schema.sql

As tabelas ficam protegidas por Row Level Security. Cada usuário só consegue consultar e alterar as próprias linhas.

## 3. Pegar as credenciais públicas

No painel do Supabase, abra o Connect/API Keys e copie:

- Project URL
- Publishable key

A publishable key pode ficar no código do navegador quando as tabelas estiverem protegidas por RLS. Nunca coloque uma secret/service_role key no site.

## 4. Colocar no site

Abra:

js/config.js

e substitua:

YOUR_SUPABASE_URL
YOUR_SUPABASE_PUBLISHABLE_KEY

pelos valores do seu projeto.

## 5. Configurar o endereço do site

No Supabase, em Authentication > URL Configuration:

Site URL:
https://kohl-edu.github.io/mana/

Adicione como Redirect URL:
https://kohl-edu.github.io/mana/progresso.html

## 6. Primeiro acesso

O usuário cria uma conta com nome, e-mail e senha.

Se houver dados antigos no localStorage do mesmo navegador, a versão 2 tenta mesclar esses registros com os registros da conta e enviá-los para o banco.

Não apague o localStorage antes de fazer a primeira sincronização.

## Observação

O projeto continua funcionando em modo local enquanto js/config.js estiver com os placeholders. Depois que as credenciais forem configuradas, o login e a sincronização passam a usar Supabase.
