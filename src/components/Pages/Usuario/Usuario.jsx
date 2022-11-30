import React, { useState,useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import Page from '../../common/Page'
import { Modal, Button, Row, Form, InputGroup, Col, Spinner   } from 'react-bootstrap';
import CommonTable from '../../common/CommonTable';
import { EditOutlined, DeleteOutline, Close, CollectionsOutlined, LabelImportantOutlined } from '@mui/icons-material'
import ApiRequest from '../../../helpers/axiosInstances';

const Usuario = (props) => {

    const [usuarioData, setUsuarioData] = useState({
        correo:"",
        password:"",
        tipoUsuario:"",
        nombre:"",
        apellido:"",
        run:"",
        activo: ""
    });
    const [idUsuario, setIdUsuario] = useState();
    const [listadoUsuarios, setListadoUsuarios] = useState([]);
    const [show, setShow] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const handleClose = () => {setShow(false)};
    const handleShow = () => {setShow(true)};
    const [tiposUsuarios, setTiposUsuarios] = useState([]);

    const init = async () => {
		const { data } = await ApiRequest().get(`/usuarios`);
		setListadoUsuarios(data)
	}

    const listarTiposUsuarios = async () => {
		const { data } = await ApiRequest().get(`/tipos-usuarios`);
		setTiposUsuarios(data)
	}

    const changeModal = () => {
        setIsEdit(false);
        handleShow()
    }
    const handleSubmit = async(e) =>{
        e.preventDefault();
        if(!isEdit){
            const { data } = await ApiRequest().post(`/register/admin`, usuarioData);
        }else{
            const { data } = await ApiRequest().put(`/usuarios`, usuarioData);
        }
    }

    const handleEdit = (values) =>{
        handleShow()
        console.log(values)
    }
    const eliminarUsuario = (values) =>{
        console.log(values)
    }

    const setColor = (estado) => {
		if(estado == '1') {
			return "green";
		} else if(estado == '0'){
			return "red";	
		} 	
	}

    
	const disabledDelete = (value) => {
		if(value == 0) {
			return false;
		} return true;
	}

    const columns = [
        { field: 'id', headerName: 'identificador', width: 150 },
        { field: 'emailUsuario', headerName: 'Correo', width: 200 },
        { field: 'nombreUsuario', headerName: 'Nombre', width: 200 },
        { field: 'apellidoUsuario', headerName: 'Apellido', width: 200 },
        { field: 'runUsuario', headerName: 'Run', width: 200 },
        { field: 'descripcionUsuario', headerName: 'Tipo de usuario', width: 200 },
        { field: 'estadoUsuario', headerName: 'Estado', width: 100 },
        { field: 'estadoUsuario', headerName: 'Estado', width: 150, renderCell: (params)=> (
            <Typography style={{fontSize: "8"}}>{params.getValue(params.id, 'descripcionEstado')}
            <LabelImportantOutlined  style={{color: setColor(params.getValue(params.id, 'estadoUsuario'))}}/></Typography>
            )
            
        },
		{
			field: '',
			headerName: 'Acciones',
			width: 400,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} 
                justifyContent="center" alignItems="center" spacing={4}>
					<Button size='sm' onClick={() => {
						setIsEdit(true);
						handleEdit(params.row)
					}}>
						<EditOutlined />
					</Button>
					<Button variant="danger" size='sm' disabled={disabledDelete(params.row.estadoUsuario)} onClick={() => {
						eliminarUsuario(params.row.id)
					}}>
						<DeleteOutline  />
					</Button>
				</Stack>
			)
		}
	]

    useEffect(()=> {
		listarTiposUsuarios();
    },[]);

    useEffect(init,[])

    return(
        <>
            <Dialog maxWidth='md' fullWidth open={show}>
                <DialogTitle>
                    <IconButton aria-label="close"
						onClick={handleClose}
						sx={{
							position: 'absolute',
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}> 
						<Close></Close>
					</IconButton>
                    {isEdit ? 'Editar usuario' : 'Agregar usuario'}
                </DialogTitle>
                <hr/>
                <DialogContent>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formRut">
                                <Form.Label>Correo</Form.Label>
                                    <InputGroup hasValidation>
                                    <Form.Control type="text" 
                                            placeholder="Ingrese un correo"
                                            onChange={e=>(setUsuarioData({
                                                ...usuarioData,
                                                correo: e.target.value
                                            }))}
                                                
                                            />
                                    <Form.Control.Feedback type="invalid">
                                        {/*msgErrors.runError*/}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formRut">
                                <Form.Label>Contraseña</Form.Label>
                                    <InputGroup hasValidation>
                                    <Form.Control type="password" 
                                            placeholder="Ingrese una contraseña"
                                            //value={datosClientes.run}
                                            onChange={e=>(setUsuarioData({
                                                ...usuarioData,
                                                password: e.target.value
                                            }))}
                                            />
                                    <Form.Control.Feedback type="invalid">
                                        {/*msgErrors.runError*/}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>    
                        </Row>
                        <Row className="mb-3">
                        <Form.Group as={Col} md="6" controlId="formRubro">
											<Form.Label>Tipo usuario</Form.Label>
											<InputGroup hasValidation>
											<Form.Select aria-label="Rubro"
														value={usuarioData.tipoUsuario}
														onChange={e => {
															(setUsuarioData({
															...usuarioData,
															tipoUsuario: e.target.value
															})
														)
														}
														}
														>
											<option hidden value={0}>Seleccione una región</option>
											{
												tiposUsuarios.map((item, index) => (
													<option value={item.id} key={index}>{item.tipoUsuario}</option>
												))
											}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
                            <Form.Group as={Col} md="6" controlId="formRut">
                                <Form.Label>Nombre</Form.Label>
                                    <InputGroup hasValidation>
                                    <Form.Control type="text" 
                                            placeholder="Ingrese un nombre"
                                            //value={datosClientes.run}
                                            onChange={e=>(setUsuarioData({
                                                ...usuarioData,
                                                nombre: e.target.value
                                            }))}
                                            />
                                    <Form.Control.Feedback type="invalid">
                                        {/*msgErrors.runError*/}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>    
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col} md="6" controlId="formRut">
                                <Form.Label>Apellido</Form.Label>
                                    <InputGroup hasValidation>
                                    <Form.Control type="text" 
                                            placeholder="Ingrese un apellido"
                                            //value={datosClientes.run}
                                            onChange={e=>(setUsuarioData({
                                                ...usuarioData,
                                                apellido: e.target.value
                                            }))}
                                            />
                                    <Form.Control.Feedback type="invalid">
                                        {/*msgErrors.runError*/}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group as={Col} md="6" controlId="formRut">
                                <Form.Label>Run</Form.Label>
                                    <InputGroup hasValidation>
                                    <Form.Control type="text" 
                                            placeholder="Ingrese un run"
                                            //value={datosClientes.run}
                                            onChange={e=>(setUsuarioData({
                                                ...usuarioData,
                                                run: e.target.value
                                            }))}
                                            />
                                    <Form.Control.Feedback type="invalid">
                                        {/*msgErrors.runError*/}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>    
                        </Row>
                        <Row className="mb-3">
                        <Form.Group as={Col} md="10" controlId="formRut">
                                <Form.Label></Form.Label>
                                    <InputGroup hasValidation>
                                    <Form.Control type="text" 
                                           hidden
                                            />
                                    <Form.Control.Feedback type="invalid">
                                        {/*msgErrors.runError*/}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>  
                        <Form.Group as={Col} md="2" controlId="formRazonSocial">
											<Form.Label>¿Usuario activo?</Form.Label>
												<InputGroup hasValidation>
													<Form.Check type="switch" 
                                                    onChange={e=> (setUsuarioData({
                                                        ...usuarioData, activo: e.target.checked
                                                    }))}
												    />
												<Form.Control.Feedback type="invalid">
														
													</Form.Control.Feedback>
												</InputGroup>
										</Form.Group>
                        </Row>
                        <DialogActions>
							<Button variant="secondary" onClick={handleClose}>
								Cerrar
							</Button>
							<Button variant="primary" type='submit'> 
                                Guardar
							</Button>
						</DialogActions>
                    </Form>
                </DialogContent>
            </Dialog>


            <Page title="YUYITOS | usuarios">
                <Container maxWidth='xl'> 
                    <Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de usuarios</Typography>
					</Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            <Row >
                                <Col  xl={9}>
                                    <Button variant="primary" onClick={changeModal}>
                                        Nuevo usuario
                                    </Button>
                                </Col>
                                <Col  xl={3}>
                                    <Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
                                </Col>
                            </Row>
                        </Grid>
                         {/**DATA TABLE */}
                        <Grid item xs={12} sm={12}>
                            <CommonTable data={listadoUsuarios} columns={columns} autoHeight={false}/>
                        </Grid>
                    </Grid>
                </Container>
            </Page>
        </>
    )

}
export default Usuario;