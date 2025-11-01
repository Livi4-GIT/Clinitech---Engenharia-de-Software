# 🩺 Clinitech — Aplicativo de Gestão Médica

### Diretório do Projeto

Bem-vindos(as) ao repositório oficial do aplicativo **Clinitech**, um sistema desenvolvido para otimizar processos de agendamento e atendimento médico em clínicas e hospitais.  

O **Clinitech** oferece uma experiência intuitiva tanto para médicos quanto para pacientes, facilitando marcação de consultas, emissão de atestados, visualização de exames e comunicação, voltado para maior organização, agilidade e acessibilidade entre usuários.

---

## 🚀 Tecnologias Utilizadas

- **Front-end:** React Native, com interface móvel para Android e iOS  
- **Back-end:** Simulado via armazenamento local (sem servidor externo)
- **Banco de Dados:** **AsyncStorage**, para persistência de dados local em formato chave-valor
- **Ambiente de Execução:** Node.js + Expo

  > O uso do **React Native** garante responsividade e usabilidade intuitiva, enquanto o **AsyncStorage** permite armazenar dados de usuários, consultas e exames diretamente no dispositivo.

---

## 👥 Perfis de Usuário

### 🔹 Visão do Paciente
- Marcar e cancelar consultas
- Cadastrar convênios médicos
- Enviar e visualizar exames
- Visualizar receitas e atestados
- Acessar chat simplificado com médico

### 🔹 Visão do Médico
- Gerenciar consultas (marcar/remover)
- Solicitar e visualizar exames dos pacientes
- Emitir receitas e atestados
- Acessar chat integrado com pacientes

---

## 📁 Estrutura do Projeto

```bash
Clinitech/
│
├── assets/              # Ícones e imagens
├── components/          # Componentes da interface do aplicativo
├── App.js               # Arquivo principal do projeto
├── package.json         # Dependências e scripts do projeto
└── README.md            # Documentação do repositório
```

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar o aplicativo em seu dispositivo.

### 1️⃣ Pré-requisitos

Certifique-se de ter instalado:
- Em seu computador:
  - [Node.js](https://nodejs.org/)  
  - [Git](https://git-scm.com/)  
- Em seu celular:
  - [Expo Go](https://expo.dev/client)
 
### 2️⃣ Clonando o Repositório
Copie o URL do repositório e execute no terminal:
```bash
git clone https://github.com/seu-usuario/clinitech.git
cd clinitech
```
> Dica: para verificar o diretório atual, use pwd (Linux/macOS) ou cd (Windows).

### 3️⃣ Instalando as Dependências
Dentro da pasta do projeto, instale as dependências com:
```bash
npm install
```

### 4️⃣ Iniciando o Projeto
Para iniciar o expo, basta digitar:
```bash
npx expo start
```
Isso abrirá o menu do Expo contendo várias opções um código QR.

5️⃣ Executando no Dispositivo
Abra o aplicativo Expo Go no celular, escaneie o código QR gerado no terminal de sua máquina e aguarde o carregamento do aplicativo.

---

## 👩‍💻 Equipe de Desenvolvimento
- Ana Beatriz Sousa Lima
- Daniel Borrachina Clemente
- Livia Lirio Severi
- Luanna Pinto Gonçalves
- Lucas Masashi Yamashiro

---
## 📜 Licença
Este projeto é de uso acadêmico e foi desenvolvido para fins educacionais na disciplina de Engenharia de Software.

### Professora: Renata M Nogueira de Oliveira
