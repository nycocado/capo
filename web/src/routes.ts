export const ROUTES = {
    home: '/',
    login: '/login',
    roles: '/roles',
    cut: '/cut',
    assembly: '/assembly',
    weld: '/weld',
    admin: '/admin/dashboard',
    unauthorized: '/unauthorized',
};

export const API_ROUTES = {
    verify: '/verify',
    auth: {
        base: '/auth',
        login: '/auth/login',
        validate: '/auth/validate',
    },
    user: {
        base: '/user',
        roles: '/user/roles',
    },
    project: {
        base: '/project',
        admin: '/project/admin',
        adminId: (param: string | number) => `/project/admin/${param}`,
    },
    admin: {
        base: '/admin',
        verify: '/admin/verify',
    },
    cuttingOperator: {
        base: '/cutting-operator',
        verify: '/cutting-operator/verify',
    },
    pipeFitter: {
        base: '/pipe-fitter',
        verify: '/pipe-fitter/verify',
    },
    welder: {
        base: '/welder',
        verify: '/welder/verify',
    },
    statistic: {
        base: '/statistic',
        overall: (param: string | number) => `/statistic/overall/${param}`
    },
    pipeLength: {
        base: '/pipe-length',
        cut: '/pipe-length/cut',
    },
    joint: {
        base: '/joint',
        assembly: '/joint/assembly'
    },
    rev: {
        base: '/rev',
        document: (param: string | number) => `/rev/document/${param}`,
    }
}

