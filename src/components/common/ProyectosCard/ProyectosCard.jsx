import React from 'react'
import MainCard from '../MainCard'
import { styled } from '@mui/material/styles'
import { Typography, Box, Stack, IconButton, Tooltip } from '@mui/material'
import { DeleteForeverOutlined } from '@mui/icons-material'

const StyledCard = styled(MainCard)(({ theme, imagen }) => ({
    background: `url(${imagen})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 25,
    minHeight: 350,
    '&:after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        width: 400,
        height: '100%',
        bottom: 0,
        zIndex: 1,
        background: 'linear-gradient(to top, #000000, rgba(0,0,0,0))'
    }
}))


const ProyectosCard = ({ imagen, descripcion, titulo, fecha, actionDelete }) => {
    return (
        <StyledCard imagen={imagen} border={false} content={false}>
            <Tooltip title='Eliminar Proyecto'>
                <IconButton onClick={actionDelete} sx={{ position: 'absolute', top: 0, right: 15, color: '#ffffff', zIndex: 2 }}>
                    <DeleteForeverOutlined />
                </IconButton>
            </Tooltip>
            <Box py={3} sx={{
                position: 'absolute',
                zIndex: 2,
                bottom: 0,
                width: '100%',
                left: 15
            }}>
                <Stack direction='column'>
                    <Typography sx={{ color: '#ffffff' }}>{descripcion}</Typography>
                    <Typography sx={{ color: '#ffffff' }}><b>{titulo}</b></Typography>
                    <Typography sx={{ color: '#ffffff' }}>{fecha}</Typography>
                </Stack>
            </Box>
        </StyledCard>
    )
}

export default ProyectosCard