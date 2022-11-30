import React, { useState, useEffect, useRef } from 'react'
import { Redirect } from 'react-router-dom'
import ApiRequest from '../helpers/axiosInstances'



const RouteController = props => {
	const { component: Component, ...rest } = props

	const [isTokenOk, setIsTokenOk] = useState(true)

	const init = async () => {
		//console.log((JSON.parse(localStorage.getItem("auth"))).id)
		//const { data } = await ApiRequest().get(`/login`, { withCredentials: true });
		if (localStorage.getItem("auth")) {
			const auth = JSON.parse(localStorage.getItem("auth"))
			if (auth.isAuth==true) {
				setIsTokenOk(true)
			} else {
				setIsTokenOk(false)
			}
		} else {
			setIsTokenOk(false)
		}
		
	}

	useEffect(init, [])

	return isTokenOk ? <Component {...rest} /> : <Redirect to='/login' />
}


{/*<><> <Component {...rest} /></>*/} 
{/* **/}
export default RouteController
