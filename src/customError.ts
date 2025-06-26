type Response = {
    data: {
        message: string
    },
    status: number
}

class MeuErro extends Error {
    response: Response = {
        data: { message: '' },
        status: 0
    }

    constructor(mensagem: string, response: Response) {
        super(mensagem)
        this.response = response
    }
}


export { MeuErro}