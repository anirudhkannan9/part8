import React, { useEffect, useState } from 'react'
import { useMutation } from '@apollo/client'

import { EDIT_NUMBER } from '../queries'

const PhoneForm = ( { setError }) => {
    const [ name, setName ] = useState('')
    const [ phone, setPhone ] = useState('')

    const [ changeNumber, result ] = useMutation(EDIT_NUMBER)

    const submit = event => {
        event.preventDefault()

        changeNumber({ variables: { name, phone } })

        setName('')
        setPhone('')
    }

    useEffect(() => {
        if (result.data && result.data.editNumber === null) {
            setError('contact not found')
        }
    }, [ result.data ]) // eslint-disable-line 

    return (
        <div>
            <h2>Update a contact's phone number</h2>

            <form onSubmit={ submit }>
                <div>
                    name <input
                            value={ name }
                            onChange={ ({target}) => setName(target.value) }
                         />
                </div>
                <div>
                    number <input
                                value={ phone }
                                onChange={ ({target}) => setPhone( target.value ) }
                            />
                </div>
                <button type='submit'> update number </button>
            </form>
        </div>
    )
}

export default PhoneForm

