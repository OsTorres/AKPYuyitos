import React, { useState, useEffect } from 'react'
import { Box, Container, Typography, Grid, Pagination, Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material'
import Page from '../../common/Page'
import ApiRequest from '../../../helpers/axiosInstances'
// ----------------------------------------------------------------------
import ProyectosCard from '../../common/ProyectosCard'
import { transformDate } from '../../../helpers/utils'
import ToastAutoHide from '../../common/ToastAutoHide'

const Proyectos = () => {
    const initialState = { titulo: '', descripcion: '', fecha: transformDate(new Date()) }
    const [proyectosList, setProyectosList] = useState([])
    const [page, setPage] = useState(0)
    const [body, setBody] = useState(initialState)
    const [openDialog, setOpenDialog] = useState(false)
    const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null })

    const handleDialog = () => {
        setOpenDialog(prev => !prev)
    }

    const handlePage = (event, newPage) => {
        setPage(newPage - 1)
    }

    const getProyectos = async () => {
        try {
            const { data } = await ApiRequest().get('/proyectos')
            setProyectosList(data)
        } catch (error) {
            console.log(error)
        }
    }

    const onChange = ({ target: { name, value } }) => {
        setBody({ ...body, [name]: value })
    }

    const submitProyecto = async () => {
        try {
            const { data } = await ApiRequest().post('/proyectos/guardar', body)
            handleDialog()
            getProyectos()
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            })
            setBody(initialState)
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            })
        }
    }

    const deleteProyecto = async (id) => {
        try {
            const { data } = await ApiRequest().post('/proyectos/eliminar', { id: id })
            getProyectos()
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            })
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            })
        }
    }

    useEffect(getProyectos, [])

    return (
        <Page title="YUYITOS | Proyectos">
            <ToastAutoHide message={mensaje} />
            <Dialog open={openDialog} onClose={handleDialog} fullWidth>
                <DialogTitle>Nuevo Proyecto</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <TextField
                            name='titulo'
                            margin='normal'
                            size='small'
                            value={body.titulo}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Título'
                            onChange={onChange}
                        />
                        <TextField
                            name='descripcion'
                            margin='normal'
                            size='small'
                            value={body.descripcion}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Descripción'
                            onChange={onChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='secondary' onClick={handleDialog}>Cancelar</Button>
                    <Button variant='contained' color='primary' onClick={submitProyecto}>Crear proyecto</Button>
                </DialogActions>
            </Dialog>
            <Container maxWidth="lg">
                <Box sx={{ pb: 5 }}>
                    <Typography variant="h5">Lista de proyectos</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Button variant='contained' color='primary' onClick={handleDialog}>Nuevo proyecto</Button>
                    </Grid>
                    <Grid item xs={12} sm={8} />
                    {proyectosList.slice(page * 10, page * 10 + 10).map((item, index) => (
                        <Grid key={index} item xs={12} sm={4} sx={{ mt: 3 }}>
                            <ProyectosCard
                                imagen='https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a6751000-c5f2-43d3-b58c-a400fd3ee18f/d5iitpd-a7e11e68-c61d-45f8-9907-d2d87269f494.png/v1/fill/w_900,h_563,q_80,strp/samus_aran_space_wallpaper_by_hellgunman_d5iitpd-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NTYzIiwicGF0aCI6IlwvZlwvYTY3NTEwMDAtYzVmMi00M2QzLWI1OGMtYTQwMGZkM2VlMThmXC9kNWlpdHBkLWE3ZTExZTY4LWM2MWQtNDVmOC05OTA3LWQyZDg3MjY5ZjQ5NC5wbmciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.cQKZVTxhF9hT_A-hEEDuSZ-Xonq6KxCro9bG0EQ0npQ'
                                titulo={item.titulo}
                                descripcion={item.descripcion}
                                fecha={item.fecha}
                                actionDelete={() => deleteProyecto(item.id)}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12} sm={12}>
                        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                            <Pagination
                                count={Math.ceil(proyectosList.length / 10)}
                                color='primary'
                                onChange={handlePage} />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Page>
    )
}

export default Proyectos