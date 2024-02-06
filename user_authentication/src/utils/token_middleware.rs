use std::future::{ ready, Ready };
use actix_web::{
    HttpRequest,
    FromRequest,
    web,
    dev::{ forward_ready, Service, ServiceRequest, ServiceResponse, Transform, Payload },
    Error as ActixWebError,
};
use futures_util::future::LocalBoxFuture;
use serde::{ Serialize, Deserialize };

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthenticationBody {
    token: String,
}

pub struct Protected;

// Transfom "transforms" a service by wrapping it in another service.
impl<S, B> Transform<S, ServiceRequest> for Protected
    where
        S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixWebError>,
        S::Future: 'static,
        B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixWebError;
    // indicates an error that might occur when creating the middleware instance
    type Transform = ProtectedMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(ProtectedMiddleware { service }))
    }
}





pub struct ProtectedMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for ProtectedMiddleware<S>
    where
        S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixWebError>,
        S::Future: 'static,
        B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixWebError;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        println!("Hi from start. You requested: {}", req.path());

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;

            // let body = res.clone().into_body();
            // let (http_req, payload): (&HttpRequest, &Payload) = res.parts();
            // let auth_body: web::Json<AuthenticationBody> = web::Json::<AuthenticationBody>::from_request(http_req, &mut *payload).await.unwrap();
            Ok(res)
        })
    }
}
