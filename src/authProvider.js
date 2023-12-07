const { jwtDecode } = require('jwt-decode');

const API_ENTRYPOINT ="https://gaetanthomas.tech";

export default {
    login: ({ username, password }) => {
        const request = new Request(
            `${API_ENTRYPOINT}/auth`,
            {
                method: "POST",
                body: JSON.stringify({ username: username,password: password }),
                headers: new Headers({ "Content-Type": "application/json" }),
            }
        );
        // Requete POST LOGIN
        return fetch(request)
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then(({ token }) => {
                // Recuperation Token et REQUETE CURRENTUSER

                const request = new Request(
                    `${API_ENTRYPOINT}/api/currentUser`,
                    {
                        method: "GET",
                        headers: new Headers({ "Content-Type": "application/json","Authorization": `Bearer ${token}` } ),
                    }
                );
                return fetch(request)
                    .then((response) => {
                        // SI USER TROUVÉ AVEC TOKEN
                        if (response.status === 200) {
                            return response.json();
                        }
                        throw new Error(response.statusText);
                    })
                    .then(({ roles }) => {
                        // SI USER EST ADMIN
                        if(!roles.includes("ROLE_ADMIN")){
                            throw new Error("You are not admin");
                        }
                        localStorage.setItem("token",token);
                    });

            });
    },
    logout: () => {
        localStorage.removeItem("token");
        return Promise.resolve();
    },
    checkAuth: () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                return Promise.resolve();
            }
            return Promise.reject();

        } catch (e) {
            // override possible jwtDecode error
            return Promise.reject();
        }
    },
    checkError: (err) => {
        if ([401, 403].includes(err?.status || err?.response?.status)) {
            localStorage.removeItem("token");
            return Promise.reject();
        }
        return Promise.resolve();
    },
    getPermissions: () => Promise.resolve(),
};