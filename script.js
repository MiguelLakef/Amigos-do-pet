function mostrarCadastro(pet = null, index = null) {
  document.getElementById("conteudo").innerHTML = `
    <h2>${pet ? "Editar Pet" : "Cadastro do Pet"}</h2>

    <form id="formPet">
      <input type="text" id="nome" placeholder="Nome do Pet" required value="${pet ? pet.nome : ""}">

      <input type="text" id="dono" placeholder="Nome do Dono" required value="${pet ? pet.dono : ""}">

      <input type="text" id="raca" placeholder="Raça" required value="${pet ? pet.raca : ""}">

      <input type="number" id="peso" placeholder="Peso (kg)" step="any" required value="${pet ? pet.peso : ""}">

      <input type="number" id="altura" placeholder="Altura (cm)" step="any" required value="${pet ? pet.altura : ""}">

      <input type="text" id="idade" placeholder="Idade (ex: 2 anos, 5 meses)" required value="${pet ? pet.idade : ""}">

      <textarea id="ata" rows="4" placeholder="Biografia..." required>${pet ? pet.ata : ""}</textarea>

      <input type="file" id="foto" accept="image/*" ${pet ? "" : "required"}>

      <button type="submit">${pet ? "Salvar Alterações" : "Cadastrar"}</button>
    </form>
  `;

  document.getElementById("formPet").addEventListener("submit", function (e) {
    e.preventDefault();

    const novoPet = {
      nome: document.getElementById("nome").value,
      dono: document.getElementById("dono").value,
      raca: document.getElementById("raca").value,
      peso: document.getElementById("peso").value,
      altura: document.getElementById("altura").value,
      idade: document.getElementById("idade").value,
      ata: document.getElementById("ata").value,
      foto: pet ? pet.foto : null
    };

    const fotoInput = document.getElementById("foto");

    if (fotoInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        novoPet.foto = e.target.result;
        salvarNoStorage(novoPet, index);
      };
      reader.readAsDataURL(fotoInput.files[0]);
    } else {
      salvarNoStorage(novoPet, index);
    }
  });
}

function salvarNoStorage(pet, index) {
  let pets = JSON.parse(localStorage.getItem("pets")) || [];

  if (index !== null) pets[index] = pet;
  else pets.push(pet);

  localStorage.setItem("pets", JSON.stringify(pets));
  mostrarLista();
}

function mostrarLista() {
  const pets = JSON.parse(localStorage.getItem("pets")) || [];
  let conteudo = "<h2>Pets Cadastrados</h2>";

  conteudo += `
    <div style="margin-bottom: 20px; padding: 10px; background:white; border-radius:10px; border:1px solid #ccc;">
      <input type="text" id="busca" placeholder="Buscar por nome, dono ou raça..." 
             style="width: 100%; padding: 10px; margin-bottom: 10px;" oninput="filtrarPets()">

      <select id="ordenar" onchange="filtrarPets()" style="width:100%; padding:10px;">
        <option value="">Ordenar por...</option>
        <option value="nome">Nome (A-Z)</option>
        <option value="peso">Peso (menor → maior)</option>
        <option value="altura">Altura (menor → maior)</option>
        <option value="idade">Idade (texto)</option>
      </select>
    </div>
  `;

  conteudo += `<div class="pet-list"></div>`;
  document.getElementById("conteudo").innerHTML = conteudo;

  atualizarListaFiltrada(pets);
}

function atualizarListaFiltrada(pets) {
  const lista = document.querySelector(".pet-list");
  lista.innerHTML = "";

  pets.forEach((pet, index) => {
    lista.innerHTML += `
      <div class="pet-card">
        <div style="display:flex; align-items:center;">
          <img src="${pet.foto}" alt="${pet.nome}">
          <div class="pet-info">
            <h3>${pet.nome}</h3>
            <p><strong>Dono:</strong> ${pet.dono}</p>
            <p><strong>Raça:</strong> ${pet.raca}</p>
            <p><strong>Peso:</strong> ${pet.peso} kg</p>
            <p><strong>Altura:</strong> ${pet.altura} cm</p>
            <p><strong>Idade:</strong> ${pet.idade}</p>
            <p><strong>Biografia:</strong> ${pet.ata}</p>
          </div>
        </div>

        <div class="pet-actions">
          <button onclick="verDetalhes(${index})">Ver em Tela Cheia</button>
          <button onclick="mostrarCadastro(${JSON.stringify(pet).replace(/"/g, '&quot;')}, ${index})">Editar</button>
          <button onclick="excluirPet(${index})">Excluir</button>
        </div>
      </div>
    `;
  });
}
function excluirPet(index) {
  const pets = JSON.parse(localStorage.getItem("pets")) || [];
  const nomePet = pets[index].nome;

  abrirPopupExcluir(nomePet, () => {
    pets.splice(index, 1);
    localStorage.setItem("pets", JSON.stringify(pets));
    mostrarLista();
  });
}


function verDetalhes(index) {
  const pet = JSON.parse(localStorage.getItem("pets"))[index];

  document.getElementById("conteudo").innerHTML = `
    <h2>${pet.nome}</h2>
    <img src="${pet.foto}" style="width:200px; height:200px; border-radius:20px;">
    <p><strong>Dono:</strong> ${pet.dono}</p>
    <p><strong>Raça:</strong> ${pet.raca}</p>
    <p><strong>Peso:</strong> ${pet.peso} kg</p>
    <p><strong>Altura:</strong> ${pet.altura} cm</p>
    <p><strong>Idade:</strong> ${pet.idade}</p>
    <p><strong>Biografia:</strong> ${pet.ata}</p>

    <button onclick="mostrarLista()">Voltar</button>
  `;
}

function filtrarPets() {
  const texto = document.getElementById("busca").value.toLowerCase();
  const ordenar = document.getElementById("ordenar").value;

  let pets = JSON.parse(localStorage.getItem("pets")) || [];

  pets = pets.filter(pet =>
    pet.nome.toLowerCase().includes(texto) ||
    pet.dono.toLowerCase().includes(texto) ||
    pet.raca.toLowerCase().includes(texto)
  );

  if (ordenar === "nome") pets.sort((a, b) => a.nome.localeCompare(b.nome));
  if (ordenar === "peso") pets.sort((a, b) => a.peso - b.peso);
  if (ordenar === "altura") pets.sort((a, b) => a.altura - b.altura);
  if (ordenar === "idade") pets.sort((a, b) => a.idade.localeCompare(b.idade));

  atualizarListaFiltrada(pets);
}
function abrirPopupExcluir(nome, confirmarCallback) {
  const popup = document.createElement("div");
  popup.id = "popup-confirm";

  popup.innerHTML = `
    <div class="popup-box">
      <h3>Excluir Pet</h3>
      <p>Tem certeza que deseja excluir <strong>${nome}</strong>?</p>

      <div class="popup-btns">
        <button class="btn-cancelar" onclick="this.parentElement.parentElement.parentElement.remove()">Cancelar</button>

        <button class="btn-confirmar" id="confirmarExclusao">Excluir</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("confirmarExclusao").onclick = () => {
    confirmarCallback();
    popup.remove();
  };
}


mostrarLista();
