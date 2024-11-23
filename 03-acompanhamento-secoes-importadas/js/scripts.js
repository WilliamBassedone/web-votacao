// Configuração do ambiente
const useLocalJson = true; // Trocar para false para usar o endpoint real

const BASE_URL = useLocalJson
    ? 'json' // Pasta com os arquivos locais
    : 'https://midge-able-alpaca.ngrok-free.app/api/eleicao'; // Base URL do endpoint real

const endpoints = {
    zonas: `${BASE_URL}/${useLocalJson ? 'dados-zonas.json' : 'dados-zonas'}`,
    sessoes: `${BASE_URL}/${useLocalJson ? 'dados-sessoes.json' : 'importacoes-secoes'}`,
    gerais: `${BASE_URL}/${useLocalJson ? 'dados-gerais.json' : 'importacoes-secoes'}`,
};

let generalDataInterval = null; // Intervalo para atualização dos dados gerais

// Função para buscar dados gerais
async function fetchGeneralData() {
    try {
        const cacheBuster = `?_=${new Date().getTime()}`;
        const response = await fetch(endpoints.gerais + cacheBuster);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        displaySessionDetails(data);
    } catch (error) {
        console.error("Erro ao carregar dados gerais:", error);
    }
}

// Função para buscar dados do arquivo de zonas
async function fetchZones() {
    try {
        const response = await fetch(endpoints.zonas);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        populateZoneSelect(data);
    } catch (error) {
        console.error("Erro ao carregar dados das zonas:", error);
    }
}

// Função para buscar dados filtrados por zona e sessão
async function fetchSessionDetails(zonaId, secaoId) {
    const url = `${endpoints.sessoes}?zonaId=${zonaId}&secaoId=${secaoId}&_=${new Date().getTime()}`;
    console.log(`Requisição para: ${url}`); // Para debug

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        displaySessionDetails(data);
    } catch (error) {
        console.error("Erro ao carregar dados da sessão:", error);
    }
}

// Preencher o select de Zonas
function populateZoneSelect(zones) {
    const zoneSelect = document.getElementById('zoneSelect');
    zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.zoneId;
        option.textContent = `Zona ${zone.zoneId}`;
        zoneSelect.appendChild(option);
    });

    // Evento para atualizar o select de Sessões
    zoneSelect.addEventListener('change', function () {
        const selectedZoneId = this.value;
        clearInterval(generalDataInterval); // Parar atualização automática

        if (selectedZoneId === "") {
            fetchGeneralData();
            generalDataInterval = setInterval(fetchGeneralData, 1000);
            document.getElementById('sessionSelect').disabled = true;
        } else {
            const selectedZone = zones.find(zone => zone.zoneId === selectedZoneId);
            populateSessionSelect(selectedZone ? selectedZone.sessionIds : []);
        }
    });

    // Iniciar com dados gerais
    fetchGeneralData();
    generalDataInterval = setInterval(fetchGeneralData, 1000);
}

// Preencher o select de Sessões
function populateSessionSelect(sessionIds) {
    const sessionSelect = document.getElementById('sessionSelect');
    sessionSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Todos';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    sessionSelect.appendChild(defaultOption);

    if (sessionIds.length > 0) {
        sessionSelect.disabled = false;
        sessionIds.forEach(sessionId => {
            const option = document.createElement('option');
            option.value = sessionId;
            option.textContent = `Sessão ${sessionId}`;
            sessionSelect.appendChild(option);
        });

        sessionSelect.addEventListener('change', function () {
            const zonaId = document.getElementById('zoneSelect').value;
            const secaoId = this.value;
            fetchSessionDetails(zonaId, secaoId); // Buscar detalhes ao selecionar sessão
        });
    } else {
        sessionSelect.disabled = true;
    }
}

// Exibir os detalhes da sessão
function displaySessionDetails(details) {
    document.getElementById('sessionDetails').classList.remove('d-none');
    document.getElementById('totalSecoes').textContent = details.totalSecoes;
    document.getElementById('secoesImportadas').textContent = details.secoesImportadas;
    document.getElementById('totalEleitoresPresentes').textContent = details.totalEleitoresPresentes;
    document.getElementById('percentualPresentes').textContent = details.percentualPresentes.toFixed(2);
    document.getElementById('totalAbstencoes').textContent = details.totalAbstencoes;
    document.getElementById('percentualAbstencoes').textContent = details.percentualAbstencoes.toFixed(2);
}

// Inicializar busca de zonas
fetchZones();