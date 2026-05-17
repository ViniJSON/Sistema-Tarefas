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
        if (index !== -1) {
            tarefas[index] = novaTarefa;
        }
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
    if (status) {
        resultado = resultado.filter(t => t.status === status);
    }
    if (prioridade) {
        resultado = resultado.filter(t => t.prioridade === prioridade);
    }
    return resultado;
}

$(document).ready(function () {
    carregarTarefas();
    const $form = $('#formTarefa');
    const $titulo = $('#titulo');
    const $areaObs = $('#areaObservacao');
    const $btnObservacao = $('#btnObservacao');
    const $areaTabela = $('#areaTabela');
    const $btnSubmit = $('#btnSubmit');

    function exibirErro(msg) {

        let $msg = $('#msg-erro');
        if (!$msg.length) {
            $msg = $(`
                <div id="msg-erro" 
                class="alert alert-danger mt-3 d-none">
                </div>
            `);
            $form.prepend($msg);
        }
        $msg.text(msg).removeClass('d-none').hide().fadeIn(200);
    }

    function limparErro() {
        $('#msg-erro')
            .addClass('d-none')
            .hide();
    }

    function resetarFormulario() {

        $form[0].reset();

        $('.campo-observacao').fadeOut(200, function () {
            $(this).remove();
        });

        $btnObservacao.prop('disabled', false).text('+ Adicionar observação');
        $('#btnCancelar').fadeOut();
        $btnSubmit.text('Concluir');
        $('#pMedia').prop('checked', true);
        limparErro();
        tarefaEditandoId = null;
    }

    function getCorPrioridade(prioridade) {
        if (prioridade === 'Baixa') {
            return 'success';
        }
        if (prioridade === 'Média') {
            return 'warning';
        }
        if (prioridade === 'Alta') {
            return 'danger';
        }
        return 'secondary';
    }

    function getCorStatus(status) {
        return status === 'Concluída'
            ? 'success'
            : 'secondary';
    }

    function renderizarInterface(lista = tarefas) {
        $areaTabela.empty();
        if (lista.length === 0) {
            $areaTabela.html(`
                <p class="text-center text-muted mt-4">
                    Nenhuma tarefa cadastrada.
                </p>
            `);
            return;
        }

        const html = `
            <div class="container my-4">
                <div class="bg-light shadow-sm rounded p-3 mb-4">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-4">
                            <label class="form-label fw-bold">
                                Filtrar por Status
                            </label>
                            <select id="filtro-status" class="form-select">
                                <option value="">Todos</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Concluída">Concluída</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold">
                                Filtrar por Prioridade
                            </label>
                            <select id="filtro-prioridade" class="form-select">
                                <option value="">Todas</option>
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <button 
                                type="button"
                                id="btn-filtrar"
                                class="btn btn-outline-primary w-100">
                                Filtrar
                            </button>
                        </div>
                    </div>
                </div>
                <table 
                    id="tabela-tarefas"
                    class="table table-striped table-hover shadow">
                    <thead class="table-dark">
                        <tr>
                            <th>Título</th>
                            <th>Descrição</th>
                            <th>Prioridade</th>
                            <th>Data Limite</th>
                            <th>Status</th>
                            <th>Observação</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;

        $areaTabela.html(html);
        $('#tabela-tarefas')
            .hide()
            .fadeIn(300);
        const $tbody = $('#tabela-tarefas tbody');

        lista.forEach(tarefa => {
            const $tr = $(`
                <tr data-id="${tarefa.id}" class="align-middle">
                    <td class="fw-bold">${tarefa.titulo}</td>
                    <td>${tarefa.descricao || '-'}</td>
                    <td>
                        <span class="badge bg-${getCorPrioridade(tarefa.prioridade)}">
                            ${tarefa.prioridade}
                        </span>
                    </td>
                    <td>${tarefa.dataLimite || '-'}</td>
                    <td>
                        <span class="badge bg-${getCorStatus(tarefa.status)}">
                            ${tarefa.status}
                        </span>
                    </td>
                    <td>${tarefa.observacao || '-'}</td>
                    <td>
                        <button
                            type="button"
                            class="btn btn-sm btn-warning editar me-1"
                            data-id="${tarefa.id}">
                            Editar
                        </button>
                        <button
                            type="button"
                            class="btn btn-sm btn-danger excluir"
                            data-id="${tarefa.id}">
                            Excluir
                        </button>
                    </td>
                </tr>
            `);
            if (tarefa.status === 'Concluída') {
                $tr.addClass('table-success');
            }
            $tbody.append($tr);
        });
    }

    $btnObservacao.on('click', function () {
        if ($('#inputObservacao').length) {
            return;
        }
        $areaObs.append(`
            <div class="campo-observacao mt-3">
                <label class="form-label fw-bold text-primary">
                    Observação
                </label>
                <input 
                    type="text"
                    id="inputObservacao"
                    class="form-control"
                    placeholder="Informe uma observação...">
            </div>
        `);
        $('.campo-observacao')
            .hide()
            .fadeIn(300);
        $(this)
            .prop('disabled', true)
            .text('Observação adicionada');
    });

    $form.on('submit', function (e) {
        e.preventDefault();
        const titulo = $titulo.val();

        if (!titulo || titulo.trim() === '') {
            exibirErro('O título é obrigatório.');
            return;
        }

        const prioridade = $('input[name="prioridade"]:checked').val();
        if (!prioridade) {

            exibirErro('Selecione uma prioridade.');

            return;
        }

        limparErro();

        const dados = {
            titulo: titulo,
            descricao: $('#descricao').val(),
            prioridade: prioridade,
            dataLimite: $('#data').val(),
            status: $('#status').val(),
            observacao: $('#inputObservacao').val()
        };

        atualizarTarefa(dados);
        renderizarInterface();
        resetarFormulario();
    });

    $(document).on('click', '.editar', function () {

        const id = $(this).attr('data-id');
        const tarefa = tarefas.find(t => t.id === id);
        if (!tarefa) {
            return;
        }

        tarefaEditandoId = id;

        $titulo.val(tarefa.titulo);
        $('#descricao').val(tarefa.descricao);
        $(`input[name="prioridade"][value="${tarefa.prioridade}"]`)
            .prop('checked', true);
        $('#data').val(tarefa.dataLimite);
        $('#status').val(tarefa.status);

        if (tarefa.observacao) {
            if (!$('#inputObservacao').length) {
                $btnObservacao.trigger('click');
            }
            $('#inputObservacao').val(tarefa.observacao);
        }

        if (!$('#btnCancelar').length) {
            $btnSubmit.after(`
                <button
                    type="button"
                    id="btnCancelar"
                    class="btn btn-outline-secondary mt-3 ms-2">
                    Cancelar edição
                </button>
            `);
        }

        $('#btnCancelar').fadeIn();
        $btnSubmit.text('Atualizar Tarefa');
        $('html, body').animate({
            scrollTop: $form.offset().top
        }, 500);
    });

    $(document).on('dblclick', '#tabela-tarefas tr[data-id]', function () {
        const id = $(this).attr('data-id');
        $(`button.editar[data-id="${id}"]`).trigger('click');
    });

    $(document).on('click', '.excluir', function () {
        const id = $(this).attr('data-id');
        $(this)
            .closest('tr')
            .fadeOut(300, function () {
                excluirTarefa(id);
                const resultado = filtrarTarefas(
                    $('#filtro-status').val(),
                    $('#filtro-prioridade').val()
                );
                renderizarInterface(resultado);
            });
    });

    $(document).on('click', '#btn-filtrar', function () {
        const status = $('#filtro-status').val();
        const prioridade = $('#filtro-prioridade').val();
        const resultado = filtrarTarefas(status, prioridade);
        renderizarInterface(resultado);
    });
    $(document).on('change', '#filtro-status, #filtro-prioridade', function () {
        $(this).addClass('border-primary');
        limparErro();
    });
    $(document).on('click', '#btnCancelar', function () {
        resetarFormulario();
    });
    if (tarefas.length > 0) {
        renderizarInterface();
    }
});