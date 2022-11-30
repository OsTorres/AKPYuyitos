import React, {useState, useEffect} from 'react';
import Page from '../../common/Page'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import { Modal, Button, Row, Form, InputGroup, Col, Spinner   } from 'react-bootstrap';
import { EditOutlined, DeleteOutline, Close } from '@mui/icons-material'
import CommonTable from '../../common/CommonTable';
import ApiRequest from '../../../helpers/axiosInstances';
import Swal from 'sweetalert2';

const Clientes = (props) => {

	const [clientesData, setClientesData] = useState({
		run: "",
		nombre: "",
		apellido: "",
		correo: "",
		telefono: ""
	});

	//VARIABLES PARA EL MENSAJE DE ERROR
	const [msgErrors, setMsgErrors] = useState({
		runError: "",
		nombreError: "",
		apellidoError: "",
		correoError: "",
		telefonoError: ""
	});

	//VARIABLES PARA VERIFICAR QUE CAMPO NECESITA SER VALIDADO (TRUE: BIEN, FALSE: VALIDAR)
	const [isError, setIsError] = useState({
		run: false,
		nombre: false,
		apellido: false,
		correo: false,
		telefono: false
	});

	const [idCliente, setIdCliente] = useState();
    const [listadoClientes, setListadoClientes] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false), setErrroresFomr()};
    const handleShow = () => {setShow(true), setBotones()};
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);

    const init = async () => {
		const { data } = await ApiRequest().get(`/listar-cliente`);
		setListadoClientes(data)
	}

	const initId = async (buscar) => {

		if(buscar.length >= 2) {
			const { data } = await ApiRequest().get(`/cliente/${buscar}`)
			setListadoClientes(data);	
		} else {
			init() 
		}
	}

    const changeModal = () => {
        setIsEdit(false);
	
        handleShow()
    }


	function setErrroresFomr() {
		setIsError({
			isError,
			run: false,
			nombre: false,
			apellido: false,
			correo: false,
			telefono: false
		})
		setMsgErrors({
			...msgErrors,
			runError: "",
			nombreError: "",
			apellidoError: "",
			correoError: "",
			telefonoError: ""
		})
		setClientesData({
			...clientesData,
			run: "",
			nombre: "",
			apellido: "",
			correo: "",
			telefono: ""
		})
		setIdCliente(null)
	}

	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/cliente/${id}`);
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: data.message,
				showConfirmButton: true,
				timer: 2500
			})
		init();
	}

	//mensaje de eliminacion si se presiona el boton eliminar ejecuta la función de arriba que cambia el estado de un proveedor
	const eliminarCliente = (id) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar este cliente?!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Eliminar!'
		}).then((result) => {
			if (result.isConfirmed) {
				confirmarEliminacion(id);
			}
		})		
	}

	function setBotones () {
		setGuardando(false);
		setGuardandoHidden(true);
	}

    const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);

		if(!isEdit) {
			const { data } = await ApiRequest().post(`/cliente`, clientesData);
			if(data.errors == undefined) {
				//mensaje de confirmación de registro guardado
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				handleClose()
				init()	
			} else { 
				//listado de errores
				let errors = []
				let msg = []
				data.errors.map((item)=> {
					errors.push([item.param, true])
					msg.push([item.param+'Error', item.msg])
				});	

				const objError = Object.fromEntries(errors);
				const objMsg = Object.fromEntries(msg);
				setIsError(objError);
				setMsgErrors(objMsg);
				setBotones();	
			}
			
		} else {
			const { data } = await ApiRequest().put(`/cliente/${idCliente}`, clientesData);
			if(data.errors == undefined) {
				//mensaje de confirmación de registro guardado
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: data.message,
					showConfirmButton: true,
					timer: 2500
				})
				handleClose()
				init()	
			} else { 
				//listado de errores
				let errors = []
				let msg = []
				data.errors.map((item)=> {
					errors.push([item.param, true])
					msg.push([item.param+'Error', item.msg])
				});	

				const objError = Object.fromEntries(errors);
				const objMsg = Object.fromEntries(msg);
				setIsError(objError);
				setMsgErrors(objMsg);	
				setBotones();
			}
		}
    }

    const handleEdit = (values) => {

		setIdCliente(values.id);
		setClientesData({
			...clientesData,
			run: values.runCliente,
			nombre: values.nombreCliente,
			apellido: values.apellidoCliente,
			correo: values.emailCliente,
			telefono: values.telefonoCliente
		})
		handleShow();
    }

    const columns = [
        { field: 'runCliente', headerName: 'Run', width: 200 },
        { field: 'nombreCliente', headerName: 'Nombre', width: 200 },
        { field: 'apellidoCliente', headerName: 'Apellido', width: 200 },
        { field: 'emailCliente', headerName: 'Correo', width: 200 },
        { field: 'telefonoCliente', headerName: 'Teléfono', width: 200 },
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
					<Button variant="danger" size='sm' onClick={() => {
						eliminarCliente(params.row.id)
					}}>
						<DeleteOutline  />
					</Button>
				</Stack>
			)
		}
	]

    useEffect(init, [])

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
						{isEdit ? 'Editar cliente' : 'Agregar cliente'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
						<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formNombre">
											<Form.Label>Nombre</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese nombre cliente"
														value={clientesData.nombre}
														onChange={e => {
															(setClientesData({
																...clientesData,
																nombre: e.target.value
															})
															), 
															setIsError({...isError, nombre: false})}
															}
														isInvalid={isError.nombre}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.nombreError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formApellidos">
											<Form.Label>Apellidos</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese apellidos cliente"
														value={clientesData.apellido}
														onChange={e => {
															(setClientesData({
																...clientesData,
																apellido: e.target.value
															})
															), 
															setIsError({...isError, apellido: false})}
															}
														isInvalid={isError.apellido}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.apellidoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
						</Row>
						<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formRun">
											<Form.Label>RUN</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese run cliente"
														value={clientesData.run}
														onChange={e => {
															(setClientesData({
																...clientesData,
																run: e.target.value
															})
															), 
															setIsError({...isError, run: false})}
															}
														isInvalid={isError.descripcion}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.runError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										<Form.Group as={Col} md="6" controlId="formEmail">
											<Form.Label>Email</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese email cliente"
														value={clientesData.correo}
														onChange={e => {
															(setClientesData({
																...clientesData,
																correo: e.target.value
															})
															), 
															setIsError({...isError, correo: false})}
															}
														isInvalid={isError.correo}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.correoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
						</Row>
						<Row className="mb-3">
										<Form.Group as={Col} md="6" controlId="formTelefono">
											<Form.Label>Teléfono</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
														placeholder="Ingrese teléfono cliente"
														value={clientesData.telefono}
														onChange={e => {
															(setClientesData({
																...clientesData,
																telefono: e.target.value
															})
															), 
															setIsError({...isError, telefono: false})}
															}
														isInvalid={isError.telefono}/>
											<Form.Control.Feedback type="invalid">
												{msgErrors.telefonoError}
											</Form.Control.Feedback>
											</InputGroup>
										</Form.Group>
										
						</Row>
									
						<DialogActions>
							<Button variant="secondary" onClick={handleClose}>
								Cerrar
							</Button>
							<Button variant="primary" 
							type='submit'
							hidden={guardando}>
								Guardar
							</Button>
							<Button variant="primary" hidden={guardandoHidden} disabled={guardando}>
							<Spinner
							as="span"
							animation="border"
							size="sm"
							role="status"
							aria-hidden="true"
							/> ..Guardando
							</Button>
						</DialogActions>
					</Form>
				</DialogContent>
			</Dialog>

            <Page title="YUYITOS | clientes">
                <Container maxWidth='xl'>
                    <Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de clientes</Typography>
					</Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}> 
                            {/**BOTON PARA ABRIR MODAL */}
                            <Row >
                                <Col  xl={9}>
                                    <Button variant="primary" onClick={changeModal}>
                                        Nuevo cliente
                                    </Button>
                                </Col>
                                <Col  xl={3}>
                                    <Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
                                </Col>
                            </Row>
                        </Grid>
                        {/**DATA TABLE */}
                        <Grid item xs={12} sm={12}>
                            <CommonTable data={listadoClientes} columns={columns} autoHeight={false}/>
                        </Grid>     
                    </Grid>
                </Container>
            </Page>
        </>     
    )

}

export default Clientes;