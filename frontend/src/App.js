import React, { Component }from 'react';
import axios from 'axios';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label} from 'reactstrap';
import './css/style.css';

class App extends Component {
    state = {
        tasks: [],
        newTaskData: {
            name: '',
            status: '',
            file: null,
        },
        newTaskModal: false,
        filterTasksData: '',
        filterTasksModal : false,
        editTaskData: {
            id: '',
            name: '',
            status: '',
            file: null,
        },
        editTaskModal: false,
        detailsTaskData: {
            id: '',
            name: '',
            date: '',
            status: '',
            file: null,
        },
        detailsTaskModal: false,
        loginModal: false,
        loginData: {
            username: '',
            password: '',
        },
        loggedInData: {
            username: '',
            password: '',
        },
        registerModal: false,
        registerData: {
            username: '',
            email: '',
            password: '',
            password2: '',
        }
    };
    componentDidMount() {
        axios.get('http://localhost:8000/tasks/').then((response) => {
            this.setState({
                tasks: response.data,
            })
        });
        this._refreshTasks()
    }
    toggleNewTaskModal() {
        this.setState({
            newTaskModal: ! this.state.newTaskModal
        });
    }
    addTask(){
        const fd = new FormData();
        fd.append('name', this.state.newTaskData.name);
        fd.append('status', this.state.newTaskData.status);
        if (this.state.newTaskData.file != null) {
            fd.append('file', this.state.newTaskData.file, this.state.newTaskData.file.name);
        }
        let token = localStorage.getItem('token');
        axios.post('http://localhost:8000/tasks/', fd,
            {headers: {'Authorization': 'Bearer ' + token}})
            .then((response) => {
                let {tasks} = this.state;
                tasks.push(response.data);
                this.toggleNewTaskModal()
                this.setState({
                    tasks,
                    newTaskData: {
                        name: '',
                        status: '',
                        file: null,
                    }
                });
            })
            .catch(function (error) {
            if (error.response.status === 401) {
                alert('You have to be logged in to do this!');
            }
        });
        this._refreshTasks()
    }
    toggleFilterTasksModal() {
        this.setState({
            filterTasksModal: ! this.state.filterTasksModal
        })
    }
    filterTasks(){
        axios.get('http://localhost:8000/tasks/', { params:
                { status: this.state.filterTasksData }}).then((response) => {
            this.setState({
                tasks: response.data,
                filterTasksModal : false,
                //response.data.result for pages
            })
        });
    }
    toggleEditTaskModal(){
        this.setState({
            editTaskModal: ! this.state.editTaskModal
        });
    }
    editTask(id, name, status, file){
        this.setState({
            editTaskData:{
                id, name, status, file
            },
            editTaskModal: ! this.state.editTaskModal,
        });
    }
    updateTask(){
        const fd = new FormData();
        fd.append('name', this.state.editTaskData.name);
        fd.append('status', this.state.editTaskData.status);
        let token = localStorage.getItem('token');
        axios.put('http://localhost:8000/tasks/' + this.state.editTaskData.id + '/', fd,
            {headers: {'Authorization': 'Bearer ' + token}})
            .then((response) => {
                this._refreshTasks();
                this.setState({
                    editTaskData: {
                        id: '',
                        name: '',
                        status: '',
                        file: null,
                    },
                    editTaskModal: false,
                });
            })
            .catch(function (error) {
            if (error.response.status === 401) {
                alert('You have to be logged in to do this!');
            }
        });
    }
    deleteTask(id){
        let token = localStorage.getItem('token');
        axios.delete('http://localhost:8000/tasks/' + id + '/',
            {headers: {'Authorization': 'Bearer ' + token}})
            .then((response) => {
                this._refreshTasks()
            })
            .catch(function (error) {
                if (error.response.status === 401) {
                    alert('You have to be logged in to do this!');
                }
            });
    }
    toggleDetailsTaskModal(){
        this.setState({
            detailsTaskModal: ! this.state.detailsTaskModal
        });
    }
    detailsTask(id){
        let token = localStorage.getItem('token');
        axios.get('http://localhost:8000/tasks/' + id + '/',
            {headers: {'Authorization': 'Bearer ' + token}})
            .then((response) => {
            this.setState({
                detailsTaskData: response.data,
                detailsTaskModal: !this.state.detailsTaskModal,
            })
        })
            .catch(function (error) {
                if (error.response.status === 401) {
                    alert('You have to be logged in to do this!');
                }
            });
    }
    toggleLoginModal(){
        this.setState({
            loginModal: ! this.state.loginModal
        });
    }
    login(){
        const fd = new FormData();
            fd.append('username', this.state.loginData.username);
            fd.append('password', this.state.loginData.password);

            axios.post('http://localhost:8000/login/', fd)
                .then((response) => {
                    this.setState({
                        loggedInData: {
                            username: this.state.loginData.username,
                            password: this.state.loginData.password,
                        },
                        loginModal: false,
                        });
                    localStorage.setItem('token', response.data.access);
                    localStorage.setItem('username', this.state.loggedInData.username);
                    this._refreshTasks()
                    })
                .catch(function (error) {
            if (error.response.status === 401) {
                alert('User doesn\'t exist!');
            }
            });
    }
    logout(){
        localStorage.setItem('token', '');
        localStorage.setItem('username', '');
        this._refreshTasks()
    }
    toggleRegisterModal(){
        this.setState({
            registerModal: ! this.state.registerModal
        });
    }
    register(){
        if (this.state.registerData.password === this.state.registerData.password2) {

            const fd = new FormData();
            fd.append('username', this.state.registerData.username);
            fd.append('email', this.state.registerData.email);
            fd.append('password', this.state.registerData.password);

            axios.post('http://localhost:8000/register/', fd).then((response) => {
                alert(response.data.detail)
            });

            this.toggleRegisterModal()
        }
        else {
           alert('Passwords don\'t match.')
        }
    }
    _refreshTasks(){
        axios.get('http://localhost:8000/tasks/').then((response) => {
                this.setState({
                    tasks: response.data,
                })
            });
    }
    isAuthorized(){
        let token = localStorage.getItem('token');
        console.log(token);
        return token !== ''
    }
    render() {
        let tasks = this.state.tasks.map((task) => {
           return (
               <tr key={task.id}>
                          <td>{task.id}</td>
                          <td>{task.name}</td>
                          <td>{new Date(task.date).toLocaleString()}</td>
                          <td>{task.status}</td>
                          <td>{task.file != null? <Button color="primary" size="sm" className="mr-2" >
                              {task.file == null? '' : task.file.replace(/^.*[\\\/]/, '')}</Button> : ''}
                          </td>
                          <td>
                              <Button color="info" size="sm" className="mr-2"
                                      onClick={this.detailsTask.bind(this, task.id)}>
                                  Details</Button>
                              <Button color="success" size="sm" className="mr-2"
                                      onClick={this.editTask.bind(this, task.id, task.name, task.status, task.file)}>
                                  Edit</Button>
                              <Button color="danger" size="sm"
                                      onClick={this.deleteTask.bind(this, task.id)}>
                                  Delete</Button>
                          </td>
                    </tr>
           )
        });
        return (
            <div className="App_container">
                <nav>
                    <h4 className="logo">Hello, &nbsp;
                        {this.isAuthorized() ? localStorage.getItem('username') + '!' : 'guest!' }
                    </h4>
                    <ul className="nav-menu">
                        <li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this._refreshTasks.bind(this)}>Task List</Button></li>
                        <li>
                            <Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.toggleNewTaskModal.bind(this)}>Add Task</Button>
                            <Modal isOpen={this.state.newTaskModal} toggle={this.toggleNewTaskModal.bind(this)}>
                                <ModalHeader toggle={this.toggleNewTaskModal.bind(this)}>Add a new task</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="task_name">Task Name</Label>
                                        <Input type="text" id="task_name" placeholder="Name"
                                               value={this.state.newTaskData.name}
                                               onChange={(e) => {
                                                   let { newTaskData } = this.state;
                                                   newTaskData.name = e.target.value;
                                                   this.setState({ newTaskData })
                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="task_status">Task Status</Label>
                                        <Input type="text" id="task_status" placeholder="Status"
                                               value={this.state.newTaskData.status}
                                               onChange={(e) => {
                                                   let { newTaskData } = this.state;
                                                   newTaskData.status = e.target.value;
                                                   this.setState({ newTaskData })
                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="task_file">Task File</Label>
                                        <Input type="file" id="task_file" placeholder="Attach File"
                                               //value={this.state.newTaskData.file != null? this.state.newTaskData.file : ''}
                                               onChange={(e) => {
                                                   let { newTaskData } = this.state;
                                                   newTaskData.file = e.target.files[0];
                                                   this.setState({ newTaskData })
                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.addTask.bind(this)}>Add Task</Button>{' '}
                                    <Button color="secondary"
                                            onClick={this.toggleNewTaskModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        </li>
                        <li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.toggleFilterTasksModal.bind(this)}>Filter</Button></li>
                            <Modal isOpen={this.state.filterTasksModal} toggle={this.toggleFilterTasksModal.bind(this)}>
                                <ModalHeader toggle={this.toggleFilterTasksModal.bind(this)}>Filter tasks</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="filter">Filter by status</Label>
                                        <Input type="text" id="filter" placeholder="Filter by status"
                                               value={this.state.filterTasksData} onChange={(e) => {
                                                   let { filterTasksData } = this.state;
                                                   filterTasksData = e.target.value;

                                                   this.setState({ filterTasksData })
                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.filterTasks.bind(this)}>Filter</Button>{' '}
                                    <Button color="secondary"
                                            onClick={this.toggleFilterTasksModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        <li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.toggleRegisterModal.bind(this)}>Register</Button></li>
                            <Modal isOpen={this.state.registerModal} toggle={this.toggleRegisterModal.bind(this)}>
                                <ModalHeader toggle={this.toggleRegisterModal.bind(this)}>Register</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="username">Username</Label>
                                        <Input type="text" id="username" placeholder="Username"
                                               value={this.state.registerData.username} onChange={(e) => {
                                                   let { registerData } = this.state;
                                                   registerData.username = e.target.value;

                                                   this.setState({ registerData })

                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="email">Email</Label>
                                        <Input type="text" id="email" placeholder="Email"
                                               value={this.state.registerData.email} onChange={(e) => {
                                                   let { registerData } = this.state;
                                                   registerData.email = e.target.value;

                                                   this.setState({ registerData })

                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Password</Label>
                                        <Input type="text" id="password" placeholder="Password"
                                               value={this.state.registerData.password} onChange={(e) => {
                                            let {registerData} = this.state;
                                            registerData.password = e.target.value;

                                            this.setState({registerData})
                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Repeat password</Label>
                                        <Input type="text" id="password2" placeholder="Repeat password"
                                               value={this.state.registerData.password2} onChange={(e) => {
                                                   let { registerData } = this.state;
                                                   registerData.password2 = e.target.value;

                                                   this.setState({ registerData })

                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.register.bind(this)}>Register</Button>{' '}
                                    <Button color="secondary"
                                            onClick={this.toggleRegisterModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        <li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.isAuthorized() ?
                                        this.logout.bind(this) :
                                        this.toggleLoginModal.bind(this)}>
                                        {this.isAuthorized() ?
                                        'Logout' : 'Login'}</Button></li>
                            <Modal isOpen={this.state.loginModal} toggle={this.toggleLoginModal.bind(this)}>
                                <ModalHeader toggle={this.toggleLoginModal.bind(this)}>Login</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="username">Username</Label>
                                        <Input type="text" id="username" placeholder="Username"
                                               value={this.state.loginData.username} onChange={(e) => {
                                                   let { loginData } = this.state;
                                                   loginData.username = e.target.value;

                                                   this.setState({ loginData })

                                        }}/>
                                        <Label for="password">Password</Label>
                                        <Input type="text" id="password" placeholder="Password"
                                               value={this.state.loginData.password} onChange={(e) => {
                                            let {loginData} = this.state;
                                            loginData.password = e.target.value;

                                            this.setState({loginData})
                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.login.bind(this)}>Login</Button>
                                    <Button color="secondary"
                                            onClick={this.toggleLoginModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                    </ul>
                </nav>
                <Modal isOpen={this.state.detailsTaskModal} toggle={this.toggleDetailsTaskModal.bind(this)}>
                    <ModalHeader toggle={this.toggleDetailsTaskModal.bind(this)}>Task details</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="task_id">Task ID:</Label>
                            <Input type="text" readOnly={true} id="task_id"
                                   placeholder={this.state.detailsTaskData.id}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_name">Task Name:</Label>
                            <Input type="text" readOnly={true} id="task_name"
                                   placeholder={this.state.detailsTaskData.name}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_status">Task Status:</Label>
                            <Input type="text" readOnly={true} id="task_status"
                                   placeholder={this.state.detailsTaskData.status}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_date">Task Date:</Label>
                            <Input type="text" readOnly={true} id="task_date"
                                   placeholder={new Date(this.state.detailsTaskData.date).toLocaleString()}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_file">Task File:</Label>
                            <Input type="text" readOnly={true} id="task_file"
                                   placeholder={this.state.detailsTaskData.file}/>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                                onClick={this.toggleDetailsTaskModal.bind(this)}>Ok</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.editTaskModal} toggle={this.toggleEditTaskModal.bind(this)}>
                    <ModalHeader toggle={this.toggleEditTaskModal.bind(this)}>Edit task</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="task_name">Task Name</Label>
                            <Input type="text" id="task_name" placeholder="Name"
                                   value={this.state.editTaskData.name}
                                   onChange={(e) => {
                                       let { editTaskData } = this.state;
                                       editTaskData.name = e.target.value;
                                       this.setState({ editTaskData })
                                   }}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_status">Task Status</Label>
                            <Input type="text" id="task_status" placeholder="Status"
                                   value={this.state.editTaskData.status}
                                   onChange={(e) => {
                                       let { editTaskData } = this.state;
                                       editTaskData.status = e.target.value;
                                       this.setState({ editTaskData })
                                   }}/>
                        </FormGroup>
                        {/*<FormGroup>
                            <Label for="task_file">Task File</Label>
                            <Input type="file" id="task_file" placeholder="Attach File"
                                   //value={this.state.editTaskData.file}
                                   onChange={(e) => {
                                       let { editTaskData } = this.state;
                                       editTaskData.file = e.target.files[0];
                                       this.setState({ editTaskData })
                                   }}/>
                        </FormGroup>*/}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                                onClick={this.updateTask.bind(this)}>Update Task</Button>
                        <Button color="secondary"
                                onClick={this.toggleEditTaskModal.bind(this)}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Table>
                    <thead>
                    <tr>
                          <th>#</th>
                          <th>Task Name</th>
                          <th>Task Date</th>
                          <th>Task Status</th>
                          <th>Task File</th>
                      </tr>
                    </thead>

                    <tbody>
                        {tasks}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default App;
