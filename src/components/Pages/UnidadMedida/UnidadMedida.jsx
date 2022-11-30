import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider, 
	Dialog, DialogContent, DialogTitle, DialogActions} from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close } from '@mui/icons-material'
import Page from '../../common/Page'
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';
import { Modal, Button, Row, Form, InputGroup, Col, Spinner } from 'react-bootstrap';


const UnidadMedida = () => {

	const [unidadMedida, setUnidadMedida] = useState({
		descripcion: "",
		sigla: ""
	})

	const [msgErrors, setMsgErrors] = useState({
		descripcionError: "",
		siglaError: ""
	})

	const [isError, setIsError] = useState({
		descripcion: false,
		sigla: false
	});

	const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false), setIsError(false)};
    const handleShow = () => {setShow(true), setBotones()};
	const [idEdit, setIdEdit] = useState(null);
	const [isEdit, setIsEdit] = useState(false);
    const [listadoUnidadMedida, setListadoUnidadMedida] = useState([]);
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);


    const init = async () => {
		const { data } = await ApiRequest().get(`/unidad-medida`);
		setListadoUnidadMedida(data)
	}

	const initId = async (buscar) => {

		if(buscar.length) {
			const { data } = await ApiRequest().get(`/unidad-medida/${buscar}`)
			setListadoUnidadMedida(data);	
		} else {
			init();
		}
		
	}

    const columns = [
		{ field: 'id', headerName: 'identificador', width: 260 },
        { field: 'descripcionUnidadMedida', headerName: 'descripcion', width: 350 },
		{ field: 'siglaUnidadMedida', headerName: 'sigla', width: 350 },
		{
			field: '',
			headerName: 'Acciones',
			width: 214,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={4}>
					<Button size='sm' onClick={() => {
						setIsEdit(true);
						handleEdit(params.row)
					}}>
						<EditOutlined />
					</Button>
					<Button variant="danger" size='sm' onClick={() => {
						eliminarUnidadMedida(params.row.id)
					}}>
						<DeleteOutline  />
					</Button>
				</Stack>
			)
		}
	]

    const handleEdit = (values) => {
		setIdEdit(values.id)
		setUnidadMedida({
			...unidadMedida,
			descripcion: values.descripcionUnidadMedida,
			sigla: values.siglaUnidadMedida
		})
		handleShow()
	}

	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/unidad-medida/${id}`)
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: data.message,
				showConfirmButton: true,
				timer: 2500
			})
		init();
	}

	const eliminarUnidadMedida = (id) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar esta unidad de medida?!",
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

	const changeModal = () => {
		setUnidadMedida({
			...unidadMedida,
			descripcion: "",
			sigla: ""
		})
		setIsEdit(false);	
		handleShow();
	}

	function setBotones () {
		setGuardando(false);
		setGuardandoHidden(true);
	}

	const handleSubmit = async (e) => {
		e.preventDefault();
		setGuardando(true);
		setGuardandoHidden(false);

		if(isEdit == false) {
			const { data } = await ApiRequest().post(`/unidad-medida`, unidadMedida);
			if(data.errors == undefined) {
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
			const { data } = await ApiRequest().put(`/unidad-medida/${idEdit}`, unidadMedida)

			if(data.errors == undefined) {
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
						<Close>
						</Close>
					</IconButton>
						{isEdit ? 'Editar unidad de medida' : 'Agregar unidad de medida'}
					</DialogTitle>
					<hr />
					<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
						<Row className="mb-12">
							<Form.Group as={Col} md="6" controlId="formRut">
								<Form.Label>Unidad de medida</Form.Label>
									<InputGroup hasValidation>
										<Form.Control type="text" 
												placeholder="Ingrese una unidad de medida"
												value={unidadMedida.descripcion}
												onChange={e => {
												(setUnidadMedida({
													...unidadMedida,
													descripcion: e.target.value
												})
												), 
												setIsError({...isError, descripcion: false})}}
												isInvalid={isError.descripcion}/>
										<Form.Control.Feedback type="invalid">
											{msgErrors.descripcionError}
										</Form.Control.Feedback>
									</InputGroup>
									</Form.Group>
										<Form.Group as={Col} md="6" controlId="formNombre">
											<Form.Label>Sigla</Form.Label>
											<InputGroup hasValidation>
											<Form.Control type="text" 
												placeholder="Ingrese una sigla"
												value={unidadMedida.sigla}
												onChange={e => {
													(setUnidadMedida({
													...unidadMedida,
													sigla: e.target.value
													})
													), 
													setIsError({...isError, sigla: false})}
													}
													isInvalid={isError.sigla}/>
										<Form.Control.Feedback type="invalid">
											{msgErrors.siglaError}
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
								hidden={guardando}
								> Guardar
								</Button>
								{/* BOTON GUARDANDO*/}
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
           <Page title="YUYITOS | rubros">
				<Container maxWidth='xl'>
					<Box sx={{ pb: 5 }}>
						<Typography variant="h5">Lista de unidad de medida</Typography>
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={9}>
									<Button variant="primary" onClick={changeModal}>
									Nueva unidad de medida
									</Button>
								</Col>
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					{/**DATA TABLE */}
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoUnidadMedida} columns={columns} autoHeight={false}/>
						</Grid>
					</Grid>
				</Container>
			</Page>
        </>
    );

}

export default UnidadMedida;