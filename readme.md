# SnipDeck - Documentação do Usuário

## 📋 Resumo

SnipDeck é uma aplicação Electron desenvolvida para maximizar produtividade no trabalho através de automação de tarefas repetitivas. Combina duas funcionalidades essenciais:

- **Gerenciamento de Snippets**: Armazena e acessa rapidamente textos frequentemente utilizados
- **Processamento de Links**: Abre múltiplos links do clipboard com um único comando

**Benefícios**: Economiza tempo significativo em tarefas rotineiras, reduz erros de digitação e aumenta eficiência no fluxo de trabalho.

---

## 🚀 Funcionalidades Principais

### 1. **Snippets de Texto**
- Armazena textos reutilizáveis (templates, respostas padrão, códigos, etc.)
- Acesso rápido via menu do system tray
- Copia automaticamente para o clipboard

### 2. **Processador de Links**
- Detecta automaticamente links no clipboard
- Abre múltiplos links simultaneamente no navegador
- Processa até 200 links por vez
- Preview inteligente (mostra primeiros 10 links)

---

## 🎛️ Interface do System Tray

### **Ícones de Status**
- 🟢 **Verde**: Modo links ATIVO
- 🔴 **Vermelho**: Modo links INATIVO
- **Tooltip**: Mostra status atual

### **Menu Contextual** (Clique direito no tray)
```
├── [Snippet 1]           # Seus snippets salvos
├── [Snippet 2]
├── [Snippet N]
├── ─────────────
├── Modo Links: ATIVO 🟢   # Toggle on/off
├── Processar Clipboard    # Abrir links
├── ─────────────
├── Update Snippets        # Abrir gerenciador
└── Quit                   # Fechar aplicação
```

---

## ⌨️ Atalhos de Teclado

| Combinação | Função |
|------------|--------|
| `Ctrl + Alt + C` | **Toggle** modo links (ativar/desativar) |
| `Alt + Ctrl + Shift + Space` | **Processar** links do clipboard |

---

## 📝 Usando Snippets

### **Criando Snippets**
1. Clique direito no ícone do tray
2. Selecione **"Update Snippets"**
3. Na janela do gerenciador, clique **"Adicionar Snippet"**
4. Preencha:
   - **Nome**: Identificação do snippet
   - **Conteúdo**: Texto a ser salvo
5. Clique **"Salvar"**

### **Usando Snippets**
1. Clique direito no ícone do tray
2. Selecione o snippet desejado
3. ✅ **Texto copiado automaticamente para o clipboard**

### **Gerenciando Snippets**
- **Editar**: Clique no botão "Editar" ao lado do snippet
- **Excluir**: Clique no botão "Excluir"
- **Visualizar**: Lista mostra nome e prévia do conteúdo

---

## 🔗 Usando o Processador de Links

### **Ativando o Modo Links**
**Opção 1**: Atalho `Ctrl + Alt + C`
**Opção 2**: Menu do tray → "Modo Links: INATIVO 🔴"

### **Processando Links**
1. **Copie texto** contendo links para o clipboard
2. **Ative o processador**:
   - Atalho: `Alt + Ctrl + Shift + Space`
   - OU menu: "Processar Clipboard"
3. **Visualize o preview**:
   ```
   Encontrados 25 link(s) total (mostrando primeiros 10):
   
   1. https://github.com/user/repo1...
   2. https://stackoverflow.com/questions/123...
   3. https://www.google.com
   ...
   10. https://example.com/long-url-here...
   
   ... e mais 15 link(s)
   ```
4. **Confirme** clicando em "Abrir todos os 25 links"

### **Limitações**
- **Máximo**: 200 links por processamento
- **Preview**: Mostra apenas primeiros 10 links
- **Formato**: Detecta apenas URLs com `http://` ou `https://`

---

## ⚙️ Casos de Uso Práticos

### **Para Desenvolvedores**
- Snippets com códigos/templates frequentes
- Abrir múltiplas documentações/repos simultaneamente
- Templates de commit messages, pull requests

### **Para Suporte/Atendimento**
- Respostas padrão para clientes
- Templates de emails/tickets
- Abrir múltiplos links de monitoramento

### **Para Pesquisa/Estudos**
- Salvar referências bibliográficas
- Abrir múltiplos artigos de uma vez
- Templates de anotações/resumos

### **Para Marketing/Social Media**
- Templates de posts/campanhas
- Abrir múltiplas redes sociais
- Mensagens padronizadas

---

## 🔧 Configuração e Arquivos

### **Localização dos Dados**
- **Desenvolvimento**: `./snippets.json`
- **Build/Produção**: `app.asar.unpacked/snippets.json`

### **Estrutura do snippets.json**
```json
[
  {
    "name": "Email de Boas-vindas",
    "content": "Olá! Bem-vindo à nossa plataforma..."
  },
  {
    "name": "Código HTML Base",
    "content": "<!DOCTYPE html>\n<html>..."
  }
]
```

### **Hot Reload**
- Alterações no `snippets.json` são detectadas automaticamente
- Menu do tray atualiza em tempo real

---

## 🚨 Solução de Problemas

### **Atalhos não funcionam**
- Verifique se não há conflito com outros apps
- Execute como administrador (Windows)
- Verifique permissões de acessibilidade (macOS)

### **Links não abrem**
- Certifique-se que modo links está ATIVO (ícone verde)
- Verifique se há links válidos no clipboard
- Confirme que navegador padrão está configurado

### **Snippets não aparecem**
- Verifique se arquivo `snippets.json` existe
- Confirme formato JSON válido
- Reinicie o aplicativo

### **App não aparece no tray**
- Verifique se system tray está habilitado no OS
- Procure por ícones ocultos na bandeja do sistema
- Reinicie com permissões elevadas

---

## 💡 Dicas de Produtividade

1. **Organize snippets por categoria**: Use prefixos como "Email-", "Code-", "Template-"
2. **Memorize os atalhos**: Ganhe velocidade usando `Ctrl+Alt+C` e `Alt+Ctrl+Shift+Space`
3. **Use placeholders**: Inclua `[NOME]`, `[DATA]` nos snippets para personalização rápida
4. **Backup regular**: Faça cópia do `snippets.json` periodicamente
5. **Teste links em lote**: Use com listas de URLs de monitoramento/documentação

---

## 📊 Desenvolvido para Eficiência

SnipDeck foi criado com foco na realidade do trabalho moderno, onde:
- ⏱️ **Tempo é recurso crítico**
- 🔄 **Tarefas repetitivas consomem energia mental**
- 🎯 **Automação aumenta foco nas atividades estratégicas**
- ⚡ **Pequenas otimizações geram grandes ganhos cumulativos**

*Uma ferramenta simples que transforma rotinas em vantagens competitivas.*