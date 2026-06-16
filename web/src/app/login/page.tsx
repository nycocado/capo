"use client";
import Image from "next/image";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";
import { login } from "@/lib/api";

function LoginPage() {
  const [internalId, setInternalId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ internalId, password });

      router.push(ROUTES.roles);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container
      fluid
      className="vh-100 d-flex"
      style={{ background: "var(--app-bg)" }}
    >
      <Row className="flex-grow-1 w-100 g-0">
        <Col
          md={7}
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ background: "var(--panel)" }}
        >
          <div className={error ? "" : "mb-4"}>
            <h1
              className="display-4 fw-medium text-center"
              style={{ color: "var(--text)" }}
            >
              Welcome Back
            </h1>
            {error && <Alert variant="danger">{error}</Alert>}
          </div>
          <Form
            className="w-50 px-5"
            style={{ maxWidth: "400px" }}
            onSubmit={handleSubmit}
          >
            <Form.Group controlId="formUser" className="mb-3">
              <Form.Label style={{ color: "var(--steel)" }}>User</Form.Label>
              <Form.Control
                type="text"
                className="op-field"
                value={internalId}
                onChange={(e) => setInternalId(e.target.value)}
                required
                placeholder=""
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-4">
              <Form.Label style={{ color: "var(--steel)" }}>
                Password
              </Form.Label>
              <Form.Control
                type="password"
                className="op-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder=""
              />
            </Form.Group>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                className="w-50 mx-auto fw-semibold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </Button>
            </div>
            <div className="text-center mt-3">
              <a href="#" className="text-primary text-decoration-none fs-6">
                Forgot Password
              </a>
            </div>
          </Form>
        </Col>
        <Col
          md={5}
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ background: "var(--app-bg)" }}
        >
          <div className="w-100 px-5" style={{ maxWidth: "600px" }}>
            <Image
              src="/logo.svg"
              alt="CAPO Logo"
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                margin: "0 auto",
              }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
