import React, { useState, useEffect } from 'react'
import { Container, Typography, Grid, Box, Stack, IconButton, Divider,
	Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material'
import ApiRequest from '../../../helpers/axiosInstances'
import { EditOutlined, DeleteOutline, Close } from '@mui/icons-material'
import Page from '../../common/Page'
import CommonTable from '../../common/CommonTable'
import Swal from 'sweetalert2';
import { Modal, Button, Row, Form, InputGroup, Col, Spinner } from 'react-bootstrap';

const Rubros = () => {

	const [rubro, setRubro] = useState({
		descripcion: ""
	})

	const [errorsRubro, setErrorRubro] = useState({
		descripcionError: ""
	})

	const [isError, setIsError] = useState(false);
	const [show, setShow] = useState(false);
    const handleClose = () => {setShow(false), setIsError(false)};
    const handleShow = () => {setShow(true), setBotones()};
	const [idEdit, setIdEdit] = useState(null);
	const [isEdit, setIsEdit] = useState(false);
    const [listadoRubros, setListadoRubros] = useState([]);
	const [guardandoHidden, setGuardandoHidden] = useState(true);
	const [guardando, setGuardando] = useState(false);

    const init = async () => {
		const { data } = await ApiRequest().get(`/rubros`);
		setListadoRubros(data)
	}

	const initId = async (buscar) => {

		if(buscar.length) {
			const { data } = await ApiRequest().get(`/rubros/${buscar}`)
			setListadoRubros(data);	
		} else {
			init();
		}	
	}

    const columns = [
		{ field: 'id', headerName: 'identificador', width: 230 },
        { field: 'descripcionRubro', headerName: 'descripcion', width: 600 },
		{
			field: '',
			headerName: 'Acciones',
			width: 344,
			renderCell: (params) => (
				<Stack direction='row' divider={<Divider orientation="vertical" flexItem />} justifyContent="center" alignItems="center" spacing={4}>
					<Button size='sm' onClick={() => {
						setIsEdit(true);
						handleEdit(params.row)
					}}>
						<EditOutlined />
					</Button>
					<Button variant="danger" size='sm' onClick={() => {
						eliminarRubro(params.row.id)
					}}>
						<DeleteOutline  />
					</Button>
				</Stack>
			)
		}
	]

    const handleEdit = (row) => {
		setIdEdit(row.id)
		setRubro({descripcion: row.descripcionRubro})
		handleShow()
	}

	const confirmarEliminacion = async (id) => {
		const { data } = await ApiRequest().delete(`/rubros/${id}`)
			Swal.fire({
				position: 'center',
				icon: 'success',
				title: data.message,
				showConfirmButton: true,
				timer: 2500
			})
		init();
	}

	const eliminarRubro = (id) => {
		Swal.fire({
			title: '¿Estas seguro?',
			text: "¿Deseas eliminar este rubro?!",
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
		setRubro({
			...rubro,
			descripcion: ""
		})
		handleShow();
		setIsEdit(false);	
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
			const { data } = await ApiRequest().post(`/rubros`, rubro);
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
				setErrorRubro({
					...errorsRubro,
					descripcionError: data.errors[0].msg
				})	
				setIsError(true);	
				setBotones();
			}		
		} else {
			const { data } = await ApiRequest().put(`/rubros/${idEdit}`, rubro)

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
				setErrorRubro({
					...errorsRubro,
					descripcionError: data.errors[0].msg
				})	
				setIsError(true);	
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
						<Close></Close>
					</IconButton>
						{isEdit ? 'Editar rubro' : 'Agregar rubro'}
				</DialogTitle>
				<hr />
				<DialogContent>
					<Form noValidate onSubmit={handleSubmit}>
						<Form.Group className="mb-3" controlId="formDescripcion">
							<Form.Label>Descripción rubro</Form.Label>
							<InputGroup hasValidation>
								<Form.Control type="text" 
									placeholder="Ingrese descripción de rubro"
									value={rubro.descripcion}
									onChange={e => (
										setRubro({
											...rubro,
											descripcion: e.target.value
										}), 
										setIsError(false))}
										isInvalid={isError}
								/>
								<Form.Control.Feedback type="invalid">
									{errorsRubro.descripcionError}
								</Form.Control.Feedback>
							</InputGroup>
						</Form.Group>
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
						<Typography variant="h5">Lista de rubros</Typography>
					</Box>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={12}>
							{/**BOTON PARA ABRIR MODAL */}
							<Row >
								<Col  xl={9}>
									<Button variant="primary" onClick={changeModal}>
									Nuevo rubro
									</Button>
								</Col>
								<Col  xl={3}>
									<Form.Control type="text" placeholder='Buscar' onChange={e => {initId(e.target.value)}}/>
								</Col>
							</Row>
						</Grid>
					{/**DATA TABLE */}
						<Grid item xs={12} sm={12}>
							<CommonTable data={listadoRubros} columns={columns} autoHeight={false}/>
						</Grid>
					</Grid>
				</Container>
			</Page>
        </>
    );

}

export default Rubros;