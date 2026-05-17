let tarefas = [];
let tarefaEditandoId = null;

function carregarTarefas() {
    const dados = localStorage.getItem('tarefas_app');
    tarefas = dados ? JSON.parse(dados) : [];
}

function salvarTarefas() {
    localStorage.setItem('tarefas_app', JSON.stringify(tarefas));
}

function atualizarTarefa(dados) {
    const novaTarefa = {
    id: tarefaEditandoId || Date.now().toString(),
    titulo: dados.titulo.trim(),
    descricao: dados.descricao?.trim() || '',
    prioridade: dados.prioridade,
    dataLimite: dados.dataLimite,
    status: dados.status,
    observacao: dados.observacao?.trim() || ''
};

    if (tarefaEditandoId) {
        const index = tarefas.findIndex(t => t.id === tarefaEditandoId);
        if (index !== -1) tarefas[index] = novaTarefa;
    } else {
        tarefas.push(novaTarefa);
    }
    salvarTarefas();
    tarefaEditandoId = null;
}

function excluirTarefa(id) {
    tarefas = tarefas.filter(t => t.id !== id);
    salvarTarefas();
}

function filtrarTarefas(status, prioridade) {
    let resultado = [...tarefas];
    if (status) resultado = resultado.filter(t => t.status === status);
    if (prioridade) resultado = resultado.filter(t => t.prioridade === prioridade);
    return resultado;
}

$(document).ready(function() {
    carregarTarefas();

    const $form = $('#formTarefa');
    const $titulo = $('#titulo');
    const $btnObservacao = $('#btnObservacao');
    const $areaObs = $('#areaObservacao');
    const $areaTabela = $('#areaTabela');
    const $btnSubmit = $('#btnSubmit');

    function exibirErro(msg) {
        let $msg = $('#msg-erro');
        if (!$msg.length) {
            $msg = $('<div id="msg-erro" class="alert alert-danger mt-2 py-2" style="display:none;"></div>');
            $form.prepend($msg);
        }
        $msg.text(msg).stop(true, true).fadeIn(200);
    }
    function limparErro() {
        $('#msg-erro').stop(true, true).fadeOut(200);
    }

    $btnObservacao.on('click', function() {
        if ($('#inputObservacao').length) return;
        $areaObs.append(`
            <div class="mt-3">
                <label class="form-label fw-bold text-primary">Observação</label>
                <input type="text" id="inputObservacao" class="form-control" placeholder="Informe uma observação...">
            </div>
        `).children().last().hide().fadeIn(300);
        $(this).prop('disabled', true).text('Observação adicionada');
    });

    $form.on('submit', function(e) {
        e.preventDefault();
        const tituloVal = $titulo.val();
        
        if (!tituloVal || tituloVal.trim() === '') {
            exibirErro('O título é obrigatório para criar uma tarefa.');
            return;
        }
        limparErro();

        const $prioridadeChecked = $('input[name="prioridade"]:checked');
        if (!$prioridadeChecked.length) {
            exibirErro('Selecione uma prioridade.');
            return;
        }

        const dados = {
            titulo: tituloVal,
            descricao: $('#descricao').val(),
            prioridade: $prioridadeChecked.val(),
            dataLimite: $('#data').val(),
            status: $('#status').val(),
            observacao: $('#inputObservacao').val()
        };

        atualizarTarefa(dados);
        renderizarInterface();
        resetarFormulario();
    });

    function resetarFormulario() {
        $form[0].reset();
        $('#inputObservacao').closest('div').fadeOut(200, function() { $(this).remove(); });
        $btnObservacao.prop('disabled', false).text('+ Adicionar observação');
        $('#btnCancelar').fadeOut();
        $btnSubmit.text('Concluir');
        $('#pMedia').prop('checked', true);
        limparErro();
    }

    $(document).on('click', '#btnCancelar', function(e) {
        e.preventDefault();
        resetarFormulario();
    });

    function renderizarInterface(lista = tarefas) {
        $areaTabela.empty();
        if (lista.length === 0 && !tarefaEditandoId) {
            $areaTabela.html('<p class="text-center text-muted mt-4">Nenhuma tarefa cadastrada. Preencha o formulário acima para começar.</p>');
            return;
        }

        const htmlFiltros = `
            <div id="filtrosTarefa" class="container my-4 p-3 bg-light rounded shadow-sm">
                <div class="row g-3 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Filtrar por Status</label>
                        <select id="filtro-status" class="form-select">
                            <option value="">Todos</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Concluída">Concluída</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Filtrar por Prioridade</label>
                        <select id="filtro-prioridade" class="form-select">
                            <option value="">Todas</option>
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <button id="btn-filtrar" class="btn btn-outline-primary w-100" type="button">Filtrar</button>
                    </div>
                </div>
            </div>
        `;

        const htmlTabela = `
            <div class="container mt-2 mb-5">
                <table class="table table-striped table-hover shadow bg-white" id="tabela-tarefas">
                    <thead class="table-dark">
                        <tr>
                            <th>Título</th><th>Descrição</th><th>Prioridade</th>
                            <th>Data Limite</th><th>Status</th><th>Observação</th><th>Ações</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;

        $areaTabela.html(htmlFiltros + htmlTabela);
        $('#tabela-tarefas').hide().fadeIn(400);
        const $tbody = $('#tabela-tarefas tbody');
        
        lista.forEach(t => {
            const $tr = $(`<tr data-id="${t.id}" class="align-middle"></tr>`);
            $tr.append(`<td class="fw-bold">${t.titulo}</td>`);
            $tr.append(`<td>${t.descricao || '-'}</td>`);
            $tr.append(`<td><span class="badge bg-${getCorPrioridade(t.prioridade)}">${t.prioridade}</span></td>`);
            $tr.append(`<td>${t.dataLimite || '-'}</td>`);
            $tr.append(`<td><span class="badge bg-${getCorStatus(t.status)}">${t.status}</span></td>`);
            $tr.append(`<td>${t.observacao || '-'}</td>`);
            $tr.append(`
                <td>
                    <button type="button" class="btn btn-sm btn-warning editar me-1" data-id="${t.id}">Editar</button>
                    <button type="button" class="btn btn-sm btn-danger excluir" data-id="${t.id}">Excluir</button>
                </td>
            `);
            $tbody.append($tr);
        });
    }

    function getCorPrioridade(p) {
        if (p === 'Baixa') return 'success';
        if (p === 'Média') return 'warning';
        if (p === 'Alta') return 'danger';
        return 'secondary';
    }
    function getCorStatus(s) {
        return s === 'Concluída' ? 'success' : 'secondary';
    }

    $(document).on('click', '#areaTabela .excluir', function(e) {
        e.preventDefault(); e.stopPropagation();
        const id = $(this).attr('data-id');
        $(this).closest('tr').fadeOut(300, function() {
            excluirTarefa(id);
            renderizarInterface(filtrarTarefas($('#filtro-status').val(), $('#filtro-prioridade').val()));
        });
    });

    $(document).on('click', '#areaTabela .editar', function(e) {
        e.preventDefault(); e.stopPropagation();
        carregarNoFormulario($(this).attr('data-id'));
    });

    $(document).on('dblclick', '#areaTabela tr[data-id]', function() {
        carregarNoFormulario($(this).attr('data-id'));
    });

    $(document).on('click', '#areaTabela #btn-filtrar', function() {
        const status = $('#filtro-status').val();
        const prioridade = $('#filtro-prioridade').val();
        const resultado = filtrarTarefas(status, prioridade);
        renderizarInterface(resultado);
    });

    function carregarNoFormulario(id) {
        const tarefa = tarefas.find(t => t.id === id);
        if (!tarefa) return;

        tarefaEditandoId = id;
        $titulo.val(tarefa.titulo);
        $('#descricao').val(tarefa.descricao);
        $(`input[name="prioridade"][value="${tarefa.prioridade}"]`).prop('checked', true);
        $('#data').val(tarefa.dataLimite);
        $('#status').val(tarefa.status);

        if (tarefa.observacao) {
            if (!$('#inputObservacao').length) {
                $areaObs.append(`
                    <div class="mt-3">
                        <label class="form-label fw-bold text-primary">Observação</label>
                        <input type="text" id="inputObservacao" class="form-control">
                    </div>
                `).children().last().hide().fadeIn(200);
            }
            $('#inputObservacao').val(tarefa.observacao);
            $btnObservacao.prop('disabled', true).text('Observação adicionada');
        }

        if (!$('#btnCancelar').length) {
            $btnSubmit.after('<button type="button" id="btnCancelar" class="btn btn-outline-secondary mt-3 ms-2">Cancelar Edição</button>');
        }
        $('#btnCancelar').fadeIn();
        $btnSubmit.text('Atualizar Tarefa');
        limparErro();
        $('html, body').animate({ scrollTop: $form.offset().top }, 600);
    }

    if (tarefas.length > 0) renderizarInterface();
});