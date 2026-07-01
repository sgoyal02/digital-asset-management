import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

function AuthTestComp() {
  const auth= useAuth();
  return(
    <div>
      <div data-testid="auth">
        {auth.isAuthenticated? "true": "false"}
      </div>
      <button onClick={()=> auth.logout()}>logout</button>
      <button onClick={() => auth.setAuthData(
            "tokenxy", {id: 1, name: "test"} as any, true)
        }>
        login
      </button>
    </div>
  );
}

function renderApp() {
  return render(
    <AuthProvider>
      <AuthTestComp/>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("auth contxt- tests", () => {
  it("init not auth", () => {
    renderApp();
    expect(screen.getByTestId("auth").textContent).toBe("false");
  });

  it("login tym-set auth", () => {
    renderApp();
    fireEvent.click(screen.getByText("login"));
    expect(screen.getByTestId("auth").textContent).toBe("true");
    expect(localStorage.getItem("accessToken")).toBe("tokenxy");
  });

  it("logout test", () => {
    renderApp();
    fireEvent.click(screen.getByText("login"));
    fireEvent.click(screen.getByText("logout"));
    expect(screen.getByTestId("auth").textContent).toBe("false");
  });

  it("local store- user laod", () => {
    localStorage.setItem("accessToken", "stored");
    localStorage.setItem("user", JSON.stringify({id: 1}));
    renderApp();
    expect(screen.getByTestId("auth").textContent).toBe("true");
  });

  it("invalid-store clear", () => {
    localStorage.setItem("accessToken", "token");
    localStorage.setItem("user", "{xyz-json");
    renderApp();

    expect(localStorage.getItem("accessToken")).toBeNull();
  });

});