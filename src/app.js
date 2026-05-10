const tarefas = [];

function AdicionarObservacao() {
    document.getElementById("areaObservacao").innerHTML = `
    <div class="mb-3">
        <label class="form-label fs-5 text-primary fw-blod">
        Observação
        </label>
        <textarea class="form-control" id="observacao"></textarea>
    </div>
    `;
}

function AdicionarTarefa(tarefa) {
    tarefas.push(tarefa)
}

$("#formTarefa").submit(function(event){
    event.preventDefault();
    let titulo = $("#titulo").val();
    let descricao = $("#descricao").val();
    let prioridade = $("input[name='prioridade']:checked").val();
    let data = $("#data").val();
    let status = $("#status").val();
    let observacao = $("#observacao").val();

    let tarefa = {
    titulo,
    descricao,
    prioridade,
    data,
    status,
    observacao,
    }

    AdicionarTarefa(tarefa);

    if($("#tabelaTarefas").length === 0){
        $("#areaTabela").html(`
            <table class="table table-responsive mt-5" id="tabelaTarefas">
                <thead>
                    <tr>
                        <th>Titulo</th>
                        <th>Descrição</th>
                        <th>Prioridade
                        <select class="form-select form-select-sm mt-1" id="filtroPrioridade">
                            <option value="">Todos</option>
                            <option value="baixa">Baixa</option>
                            <option value="media">Média</option>
                            <option value="alta">Alta</option>
                        </select>
                        </th>
                        <th>Data</th>
                        <th>Status
                        <select class="form-select form-select-sm mt-1" id="filtroStatus">
                            <option value="">Todos</option>
                            <option value="pendente">Pendente</option>
                            <option value="concluida">Concluída</option>
                        </select>
                        </th>
                        <th>Observação</th>
                        <th>Funções</th>
                    </tr>
                </thead>
            <tbody></tbody>
            </table>
            `);
    }

    $("#tabelaTarefas tbody").append(`
        <tr>
            <td>${tarefa.titulo}</td>
            <td>${tarefa.descricao}</td>
            <td>${tarefa.prioridade}</td>
            <td>${tarefa.data}</td>
            <td>${tarefa.status}</td>
            <td>${tarefa.observacao}</td>
            <td><button class="btn btn-outline-primary" id="BotaoEditar">Editar</button></td>
            <td><button class="btn btn-outline-danger" id="BotaoExcluir">Excluir</button></td>
        </tr>
        `);

    $("#formTarefa")[0].reset();
});