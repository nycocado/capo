export const ROUTES = {
    home: '/',
    login: '/login',
    roles: '/roles',
    cut: '/cut',
    assembly: '/assembly',
    weld: '/weld',
    admin: '/admin',
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
        assembly: (param: string | number) => `/pipe-length/assembly/${param}`,
        editHeatNumber: '/pipe-length/edit/heat-number',
    },
    fitting: {
        base: '/fitting',
        assembly: (param: string | number) => `/fitting/assembly/${param}`,
    },
    joint: {
        base: '/joint',
        assembly: '/joint/assembly'
    },
    weld: {
        base: '/weld',
        welding: '/weld/welding',
        editFillerMaterial: '/weld/edit/filler-material',
        editWps: '/weld/edit/wps',
    },
    rev: {
        base: '/rev',
        document: (param: string | number) => `/rev/document/${param}`,
    },
    filler: {
        base: '/filler',
        weld: '/filler/weld',
    },
    wps: {
        base: '/wps',
        weld: '/wps/weld',
        document: (param: string | number) => `/wps/document/${param}`,
    }
}

