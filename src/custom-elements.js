class TodoList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .completed {
          text-decoration: line-through;
        }
        .insert__task {
          display: flex;
          flex-direction: column;
        }
        .insert__task label {
          font-size: 1.2rem;
          font-family: "Lora", serif;
        }
        .insert__task input {
          background-color: transparent;
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #09040d;
          margin-bottom: 2rem;
          padding: 0.5rem;
          font-size: 1.2rem;
          outline: none;
          font-family: "Montserrat";
        }
        .btn__submit {
          border: none;
          background-color: #603fe4;
          font-size: 1.2rem;
          padding: 0.5rem;
          color: #fffffe;
          margin: 0 auto;
          display: block;
          margin-bottom: 2rem;
          font-family: "Montserrat";
        }
        .tasks {
          border: 1px solid black;
          padding: 1rem;
        }
        .task {
          display: grid;
          grid-template-columns: 10% 40% 25% 25%;
          align-items: center;
          padding: 0.5rem;
          color: #603fe4;
          width: 95%;
        }
        .edit-button {
          border: none;
          background-color: #603fe4;
          font-family: "Montserrat";
          color: #fffffe;
          font-size: 1rem;
          margin : 0.2rem;
        }
        .delete-button {
          border: none;
          background-color: #c00d00;
          font-family: "Montserrat";
          color: #ffffff;
          font-size: 1rem;
          margin : 0.2rem 0 0.2rem 0.2rem;
        }
        .btn__remove-completed {
          position: fixed;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          border: none;
          background-color: #603fe4;
          font-family: "Montserrat";
          color: #fffffe;
          font-size: 1.2rem;
          padding: 0.5rem;
        }
      </style>
      <form class="insert__task" id="task-form">
        <label for="task-input">Nom de la tâche</label>
        <input type="text" id="task-input" name="task" placeholder="Saisissez le nom de la tâche ici" />
        <button class="btn__submit" type="submit">Ajouter ma tâche</button>
      </form> 
      <div class="tasks" id="task-list"></div>
      <button class="btn__remove-completed">Retirer les tâches effectuées</button>
    `;
  }

  connectedCallback() {
    this.taskForm = this.shadowRoot.querySelector("#task-form");
    this.taskInput = this.shadowRoot.querySelector("#task-input");
    this.taskList = this.shadowRoot.querySelector("#task-list");
    this.removeCompletedButton = this.shadowRoot.querySelector(
      ".btn__remove-completed"
    );

    this.loadTasks();

    this.taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const taskText = this.taskInput.value.trim();

      if (taskText) {
        this.addTask(taskText);
        this.saveTaskInLocalStorage(taskText);
        this.taskInput.value = "";
      }
    });

    this.removeCompletedButton.addEventListener("click", () => {
      this.removeCompletedTasks();
    });
  }

  addTask(taskText) {
    const div = document.createElement("div");
    div.classList.add("task");
    div.innerHTML = `
      <input type="checkbox" aria-label="Cochez la case pour valider la réalisation de cette tâche" id="task-checkbox" class="checkbox">
      <span class="span">${taskText}</span>
      <button class="edit-button">Modifier</button>
      <button class="delete-button">Supprimer</button>
    `;

    div.querySelector(".edit-button").addEventListener("click", () => {
      const span = div.querySelector("span");
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = span.textContent;
      div.replaceChild(editInput, span);

      const editButton = div.querySelector(".edit-button");
      editButton.textContent = "Valider";

      editInput.addEventListener("blur", () => {
        const updatedText = editInput.value;
        this.updateTaskInLocalStorage(div, updatedText);

        editButton.textContent = "Modifier";
        const newSpan = document.createElement("span");
        newSpan.classList.add("span");
        newSpan.textContent = updatedText;
        div.replaceChild(newSpan, editInput);
        console.log("Blur event triggered");
      });

      editInput.focus();
    });

    div.querySelector(".delete-button").addEventListener("click", () => {
      div.remove();
      this.removeTaskFromLocalStorage(div);
    });

    div.querySelector(".checkbox").addEventListener("change", () => {
      div.querySelector("span").classList.toggle("completed");
    });

    this.taskList.appendChild(div);
  }

  removeTaskFromLocalStorage(div) {
    const tasks = this.getTasksFromLocalStorage();
    const taskText = div.querySelector(".span").textContent;
    const index = tasks.indexOf(taskText);

    if (index !== -1) {
      tasks.splice(index, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }

  saveTaskInLocalStorage(taskText) {
    const tasks = this.getTasksFromLocalStorage();
    tasks.push(taskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  updateTaskInLocalStorage(div, updatedText) {
    const tasks = this.getTasksFromLocalStorage();
    const index = Array.from(div.parentNode.children).indexOf(div);
    tasks[index] = updatedText;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  removeCompletedTasks() {
    const completedTasks = this.shadowRoot.querySelectorAll(".completed");
    const tasks = this.getTasksFromLocalStorage();

    completedTasks.forEach((completedTask) => {
      const taskText = completedTask.textContent;
      completedTask.parentNode.remove();
      const index = tasks.indexOf(taskText);
      if (index !== -1) {
        tasks.splice(index, 1);
      }
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  getTasksFromLocalStorage() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  }

  loadTasks() {
    const tasks = this.getTasksFromLocalStorage();
    tasks.forEach((taskText) => this.addTask(taskText));
  }
}

customElements.define("todo-list", TodoList);
