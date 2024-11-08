// Gerar os campos para os dias de 1 a 31
document.addEventListener('DOMContentLoaded', function () {
    const tabelaHoras = document.getElementById('tabela-horas').getElementsByTagName('tbody')[0];

    for (let dia = 1; dia <= 31; dia++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dia}</td>
            <td><input type="time" class="entrada-manha" data-dia="${dia}"></td>
            <td><input type="time" class="saida-manha" data-dia="${dia}"></td>
            <td><input type="time" class="entrada-tarde" data-dia="${dia}"></td>
            <td><input type="time" class="saida-tarde" data-dia="${dia}"></td>
        `;
        tabelaHoras.appendChild(tr);
    }
});

// Função para calcular os minutos trabalhados entre entrada e saída
function calcularHoras(entrada, saida) {
    if (!entrada || !saida) return 0;
    
    const entradaHora = entrada.split(':');
    const saidaHora = saida.split(':');

    const entradaMinutes = parseInt(entradaHora[0]) * 60 + parseInt(entradaHora[1]);
    const saidaMinutes = parseInt(saidaHora[0]) * 60 + parseInt(saidaHora[1]);

    return saidaMinutes - entradaMinutes;  // Retornando em minutos
}

// Função para calcular as horas trabalhadas e exibir o relatório corretamente
document.getElementById('calcularHorasBtn').addEventListener('click', function() {
    let totalMinutos = 0;
    const relatorio = document.getElementById('relatorio').getElementsByTagName('tbody')[0];
    relatorio.innerHTML = ''; // Limpar relatório antes de atualizar

    for (let dia = 1; dia <= 31; dia++) {
        const entradaManha = document.querySelector(`.entrada-manha[data-dia="${dia}"]`);
        const saidaManha = document.querySelector(`.saida-manha[data-dia="${dia}"]`);
        const entradaTarde = document.querySelector(`.entrada-tarde[data-dia="${dia}"]`);
        const saidaTarde = document.querySelector(`.saida-tarde[data-dia="${dia}"]`);

        if (entradaManha && saidaManha && entradaTarde && saidaTarde) {
            const minutosManha = calcularHoras(entradaManha.value, saidaManha.value);
            const minutosTarde = calcularHoras(entradaTarde.value, saidaTarde.value);
            const totalDiaMinutos = minutosManha + minutosTarde;

            // Converter minutos para formato horas: minutos
            const horas = Math.floor(totalDiaMinutos / 60);
            const minutos = totalDiaMinutos % 60;
            const tempoFormatado = `${horas}:${minutos.toString().padStart(2, '0')}`;

            // Adicionar o total de minutos do dia no relatório
            const row = relatorio.insertRow();
            row.insertCell(0).textContent = dia;
            row.insertCell(1).textContent = tempoFormatado;
            row.insertCell(2).textContent = "N/A"; // Calcularemos o salário depois
            totalMinutos += totalDiaMinutos;
        }
    }

    // Exibir o total de minutos trabalhados
    const horasTotais = Math.floor(totalMinutos / 60);
    const minutosTotais = totalMinutos % 60;
    alert(`Total de Horas Trabalhados no Mês: ${horasTotais}:${minutosTotais.toString().padStart(2, '0')} horas`);
});

// Função para calcular o salário baseado nos minutos trabalhados
document.getElementById('calcularSalarioBtn').addEventListener('click', function() {
    const valorHora = parseFloat(document.getElementById('valorHora').value);
    const linhasRelatorio = document.querySelectorAll('#relatorio tbody tr');

    if (isNaN(valorHora)) {
        alert('Por favor, insira o valor da hora corretamente.');
        return;
    }

    let salarioTotal = 0;

    // Atualizar o salário de cada dia
    linhasRelatorio.forEach(function(row) {
        const minutosTrabalhados = parseInt(row.cells[1].textContent.split(':')[0]) * 60 +
            parseInt(row.cells[1].textContent.split(':')[1]);
        
        if (!isNaN(minutosTrabalhados)) {
            const salarioDia = (minutosTrabalhados / 60) * valorHora;
            row.cells[2].textContent = "R$ " + salarioDia.toFixed(2);
            salarioTotal += salarioDia;
        }
    });

    // Exibir o salário total
    const salarioTotalElement = document.getElementById('salario-total').querySelector('h3');
    salarioTotalElement.textContent = `Salário Total: R$ ${salarioTotal.toFixed(2)}`;
});
document.getElementById('downloadPDFBtn').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text('Relatório de Horas Trabalhadas', 10, 10);

    // Posições e margens
    let y = 20; // Posição Y inicial para a tabela
    const marginLeft = 10;
    const pageHeight = doc.internal.pageSize.height;
    const valorHora = document.getElementById('valorHora').value;
    let totalMinutos = 0;
    
    // Adicionar informações sobre o valor da hora no cabeçalho
    doc.text(`Valor da Hora: R$ ${parseFloat(valorHora).toFixed(2)}`, marginLeft, y);
    y += 10;

    // Adicionando os cabeçalhos da tabela
    doc.text('Dia', marginLeft, y);
    doc.text('Horas Trabalhadas', marginLeft + 40, y);
    doc.text('Salário (R$)', marginLeft + 100, y);
    y += 10;

    // Adicionando os dados da tabela de relatórios ao PDF
    const linhasRelatorio = document.querySelectorAll('#relatorio tbody tr');
    linhasRelatorio.forEach(row => {
        if (y > pageHeight - 20) {  // Verifica se está perto do fim da página
            doc.addPage();  // Adiciona uma nova página se necessário
            y = 20;  // Redefine a posição y
            doc.text('Dia', marginLeft, y);
            doc.text('Horas Trabalhadas', marginLeft + 40, y);
            doc.text('Salário (R$)', marginLeft + 100, y);
            y += 10;
        }

        const dia = row.cells[0].textContent;
        const horasTrabalhadas = row.cells[1].textContent;
        const salario = row.cells[2].textContent;
        
        // Adiciona as linhas ao PDF
        doc.text(dia, marginLeft, y);
        doc.text(horasTrabalhadas, marginLeft + 40, y);
        doc.text(salario, marginLeft + 100, y);
        y += 10;

        // Calcula o total de minutos trabalhados para exibir no final
        const horasArray = horasTrabalhadas.split(':');
        totalMinutos += parseInt(horasArray[0]) * 60 + parseInt(horasArray[1]);
    });

    // Exibir o salário total e total de horas no final do PDF
    if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
    }
    
    // Cálculo do total de horas e salário total
    const horasTotais = Math.floor(totalMinutos / 60);
    const minutosTotais = totalMinutos % 60;
    const salarioTotalElement = document.getElementById('salario-total').querySelector('h3').textContent;

    y += 10;
    doc.text(`Total de Horas Trabalhadas: ${horasTotais}:${minutosTotais.toString().padStart(2, '0')}`, marginLeft, y);
    y += 10;
    doc.text(salarioTotalElement, marginLeft, y);  // Salário Total
    
    // Salvar o PDF
    doc.save('Relatorio_Horas_Trabalhadas.pdf');
});
