import { useState } from "react";
import { Navigate, Route } from "react-router-dom";
import {CustomRoutes, ListGuesser, ReferenceField, TextField} from "react-admin";
import {
    fetchHydra as baseFetchHydra, FieldGuesser,
    HydraAdmin,
    hydraDataProvider as baseHydraDataProvider, ResourceGuesser,
    useIntrospection,
} from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import authProvider from "./authProvider.js";
import React from "react";

const ENTRYPOINT = "https://gaetanthomas.tech/api";
const getHeaders = () => localStorage.getItem("token") ? {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
} : {};
const fetchHydra = (url, options = {}) =>
    baseFetchHydra(url, {
        ...options,
        headers: getHeaders,
    });
const RedirectToLogin = () => {
    const introspect = useIntrospection();
    if (localStorage.getItem("token")) {
        introspect();
        return <></>;
    }
    return <Navigate to="/login" />;
};
const apiDocumentationParser = (setRedirectToLogin,entrypoint) => async () => {
    try {
        setRedirectToLogin(false);
        return await parseHydraDocumentation(entrypoint, { headers: getHeaders });
    } catch (result) {
        const { api, response, status } = result;
        if (status !== 401 || !response) {
            throw result;
        }

        // Prevent infinite loop if the token is expired
        localStorage.removeItem("token");

        setRedirectToLogin(true);

        return {
            api,
            response,
            status,
        };
    }
};
const dataProvider = (setRedirectToLogin, entrypoint) => baseHydraDataProvider({
    entrypoint: entrypoint,
    httpClient: fetchHydra,
    apiDocumentationParser: apiDocumentationParser(setRedirectToLogin,entrypoint),
    disableCache:true
});

const NftList = props => (
    <ListGuesser {...props}>
        <FieldGuesser source={"name"} />
        <ReferenceField label="Gallery" source="nftgallery" reference="galleries">
            <TextField source="name" />
        </ReferenceField>
        <FieldGuesser source={"mintdate"} />
        <ReferenceField label="Owner first name" source="owner" reference="users">
            <TextField source="name" />
        </ReferenceField>
        <FieldGuesser source={"transactions"} />
        <FieldGuesser source={"image"} />
        <FieldGuesser source={"currentOrder"} />
    </ListGuesser>
);
const Admin = (props) => {
    const [redirectToLogin, setRedirectToLogin] = useState(false);

    return (
        <>
            <HydraAdmin dataProvider={dataProvider(setRedirectToLogin,ENTRYPOINT)} authProvider={authProvider} entrypoint={ENTRYPOINT}  title={"LDT ADMIN"}   >
                <ResourceGuesser
                    name="nfts"
                    list={NftList}

                />
                <ResourceGuesser
                    name="galleries"

                />
                <ResourceGuesser
                    name="users"

                />
                <ResourceGuesser
                    name="transactions"

                />
            </HydraAdmin>
        </>
    );
}
export default Admin;