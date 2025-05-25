export const ROUTES = {
    home: '/',
    login: '/login',
    roles: '/roles',
    cut: '/cut',
    assembly: '/assembly',
    weld: '/weld',
    admin: '/admin',
};

export const API_ROUTES = {
    auth: {
        login: '/auth/login',
        validate: '/auth/validate',
    },
    user: {
        roles: '/user/roles',
    },
    cuttingOperator: {
        validate: '/cutting-operator/validate',
    },
    pipeFitter: {
        validate: '/pipe-fitter/validate',
    },
    welder: {
        validate: '/welder/validate',
    },
    statistic: {
        overall: '/statistic/overall/1',
    }
}