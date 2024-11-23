// Seleciona elementos do DOM
const formularioUpload = document.getElementById('uploadForm'); // Formulário de upload.
const entradaArquivo = document.getElementById('arquivo'); // Campo de entrada de arquivo.
const exibidorJSON = document.getElementById('jsonViewer'); // Elemento para exibir o JSON processado.
const statusMensagem = document.getElementById('statusMensagem'); // Elemento para exibir mensagens de status.

// Função para validar a estrutura do JSON
const validarEstruturaJSON = (dadosJSON) => {
    // Verifica se o JSON contém as propriedades esperadas com os tipos corretos.
    if (
        typeof dadosJSON.nomeEleicao === 'string' && // Verifica se "nomeEleicao" é uma string.
        Array.isArray(dadosJSON.candidatos) && // Verifica se "candidatos" é uma lista.
        Array.isArray(dadosJSON.zonasEleitorais) // Verifica se "zonasEleitorais" é uma lista.
    ) {
        return true; // Estrutura válida.
    }
    return false; // Estrutura inválida.
};

// Função para exibir mensagens de status
const exibirMensagem = (mensagem, tipo = 'success') => {
    // Define classes CSS para os diferentes tipos de mensagens.
    const cores = {
        success: 'text-success', // Mensagem de sucesso.
        danger: 'text-danger', // Mensagem de erro.
        warning: 'text-warning' // Mensagem de aviso.
    };
    // Insere a mensagem com a classe apropriada no elemento de status.
    statusMensagem.innerHTML = `<div class="${cores[tipo]}">${mensagem}</div>`;
};

// Função para ler o arquivo JSON
const lerArquivoJSON = (arquivo) => {
    const leitor = new FileReader(); // Cria um leitor de arquivos.
    leitor.onload = (evento) => {
        try {
            // Tenta fazer o parse do conteúdo do arquivo como JSON.
            const dadosJSON = JSON.parse(evento.target.result);

            // Valida a estrutura do JSON.
            if (!validarEstruturaJSON(dadosJSON)) {
                throw new Error("A estrutura do JSON é inválida.");
            }

            // Exibe mensagem de sucesso se o JSON for válido.
            exibirMensagem("A estrutura do JSON está correta!", 'success');
            // Exibe o JSON no HTML.
            exibirJSON(dadosJSON);
        } catch (erro) {
            // Exibe erro caso o JSON seja inválido.
            console.error("Erro ao processar JSON:", erro);
            exibidorJSON.innerHTML = ''; // Limpa o conteúdo exibido.
            exibirMensagem(`Erro: ${erro.message}`, 'danger');
        }
    };
    leitor.readAsText(arquivo); // Lê o conteúdo do arquivo como texto.
};

// Função para exibir o JSON no HTML
const exibirJSON = (dadosJSON) => {
    exibidorJSON.innerHTML = ''; // Limpa o conteúdo do elemento exibidor.
    exibidorJSON.appendChild(renderizarArvoreJSON(dadosJSON)); // Renderiza o JSON como uma árvore e insere no exibidor.
};

// Função recursiva para renderizar o JSON como uma árvore
const renderizarArvoreJSON = (json, profundidade = 0) => {
    const contenedor = document.createElement('div'); // Contêiner para os elementos.
    const eObjeto = typeof json === 'object' && json !== null; // Verifica se é um objeto.

    if (eObjeto) {
        // Itera sobre as chaves do objeto.
        for (const chave in json) {
            const valor = json[chave];
            const divChave = document.createElement('div'); // Elemento para exibir a chave.
            divChave.style.marginLeft = `${profundidade * 20}px`; // Indenta conforme a profundidade.
            divChave.innerHTML = `<strong>${chave}:</strong>`; // Insere a chave em negrito.
            const divValor = renderizarArvoreJSON(valor, profundidade + 1); // Renderiza o valor recursivamente.
            contenedor.appendChild(divChave); // Adiciona a chave ao contêiner.
            contenedor.appendChild(divValor); // Adiciona o valor ao contêiner.
        }
    } else {
        // Caso seja um valor simples, cria um elemento para exibi-lo.
        const divValor = document.createElement('div');
        divValor.style.marginLeft = `${profundidade * 20}px`; // Indenta conforme a profundidade.
        divValor.textContent = json; // Define o valor como texto.
        contenedor.appendChild(divValor); // Adiciona ao contêiner.
    }

    return contenedor; // Retorna o contêiner com a árvore renderizada.
};

// Função para enviar JSON para a API
const enviarJSONParaAPI = async (dadosJSON) => {
    const url = 'https://midge-able-alpaca.ngrok-free.app/api/eleicao'; // URL da API.

    try {
        const resposta = await fetch(url, {
            method: 'POST', // Método HTTP.
            headers: { 'Content-Type': 'application/json' }, // Define o tipo de conteúdo como JSON.
            body: JSON.stringify(dadosJSON), // Converte o JSON para string e envia no corpo da requisição.
            mode: 'cors', // Permite requisições CORS.
        });

        if (!resposta.ok) {
            // Lança erro se a resposta não for bem-sucedida.
            throw new Error(`Erro ao enviar JSON: ${resposta.statusText}`);
        }

        console.log("JSON enviado com sucesso:", await resposta.json()); // Loga a resposta da API.
        exibirMensagem("JSON enviado com sucesso!", 'success'); // Exibe mensagem de sucesso.
    } catch (erro) {
        // Trata erros de envio.
        console.error("Erro ao enviar JSON:", erro);
        exibirMensagem(`Erro ao enviar JSON: ${erro.message}`, 'danger');
    }
};

// Lidar com exibição do JSON ao carregar arquivo
entradaArquivo.addEventListener('change', (evento) => {
    const arquivo = evento.target.files[0]; // Obtém o arquivo selecionado.
    if (arquivo && arquivo.type === 'application/json') {
        // Verifica se é um arquivo JSON.
        lerArquivoJSON(arquivo); // Lê o arquivo JSON.
    } else {
        exibidorJSON.innerHTML = ''; // Limpa o exibidor.
        exibirMensagem("Por favor, selecione um arquivo JSON válido.", 'danger'); // Exibe mensagem de erro.
    }
});

// Lidar com envio do formulário
formularioUpload.addEventListener('submit', (evento) => {
    evento.preventDefault(); // Previne o comportamento padrão do formulário.
    const arquivo = entradaArquivo.files[0]; // Obtém o arquivo selecionado.

    if (arquivo && arquivo.type === 'application/json') {
        // Verifica se é um arquivo JSON.
        const leitor = new FileReader(); // Cria um leitor de arquivos.
        leitor.onload = (evento) => {
            try {
                const dadosJSON = JSON.parse(evento.target.result); // Faz o parse do conteúdo como JSON.

                if (!validarEstruturaJSON(dadosJSON)) {
                    // Valida a estrutura do JSON.
                    throw new Error("A estrutura do JSON é inválida.");
                }

                enviarJSONParaAPI(dadosJSON); // Envia o JSON para a API.
            } catch (erro) {
                // Trata erros de processamento.
                console.error("Erro ao processar JSON para envio:", erro);
                exibirMensagem(`Erro ao processar JSON: ${erro.message}`, 'danger');
            }
        };
        leitor.readAsText(arquivo); // Lê o arquivo como texto.
    } else {
        exibirMensagem("Por favor, selecione um arquivo JSON válido.", 'danger'); // Exibe mensagem de erro.
    }
});
