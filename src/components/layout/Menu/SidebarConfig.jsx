import React from 'react'
import { PersonOutlined, HomeOutlined, AssignmentIndOutlined, 
		 Inventory, SellSharp } from '@mui/icons-material'

const sidebarConfig = [
	{
		title: 'inicio',
		path: '/app',
		icon: <HomeOutlined />
	},
	{
		title: 'Caja de venta',
		path: '/app/caja',
		icon: <SellSharp />, 
		children: [
			{
				
					title: 'usuarios',
					path: '/app/usuarios',
					icon: <PersonOutlined />
					
			}
		] 
	},
	// {
	// 	title: 'usuarios',
	// 	path: '/app/usuarios',
	// 	icon: <PersonOutlined />
	// },
	/*{
		title: 'proyectos',
		path: '/app/proyectos',
		icon: <AssignmentIndOutlined />
	},*/
	// {
	// 	title: 'Proveedores',
	// 	path: '/app/proveedores',
	// 	icon: <PersonOutlined />
	// },
	// {
	// 	title: 'Productos',
	// 	path: '/app/productos',
	// 	icon: <Inventory />
	// },
	// {
	// 	title: 'Rubros',
	// 	path: '/app/rubros',
	// 	icon: <SellSharp />
	// },
	// {
	// 	title: 'Marcas',
	// 	path: '/app/marcas',
	// 	icon: <SellSharp />
	// },
	// {
	// 	title: 'Categorias',
	// 	path: '/app/categorias',
	// 	icon: <SellSharp />
	// },
	// {
	// 	title: 'Unidad de medida',
	// 	path: '/app/unidad-medida',
	// 	icon: <SellSharp />
	// },
	// {
	// 	title: 'Ordenes de compra',
	// 	path: '/app/orden-compra',
	// 	icon: <SellSharp />
	// },
	// {
	// 	title: 'Bodega de productos',
	// 	path: '/app/bodega',
	// 	icon: <SellSharp />
	// },
	// {
	// 	title: 'Clientes',
	// 	path: '/app/clientes',
	// 	icon: <SellSharp />
	// },
	// {
	// 	title: 'Usuario',
	// 	path: '/app/usuario',
	// 	icon: <SellSharp />
	// },
]

export default sidebarConfig