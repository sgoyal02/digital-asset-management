import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import Login from "./Login";
import React from "react";

//test setup--
const tstNavigate= vi.fn();
const testSetAuth= vi.fn();
const mockApiCall= vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {...actual,
    useNavigate: () => tstNavigate,
  };
});
vi.mock("../hooks/useAuth", () => ({
  useAuth:() => ({setAuthData: testSetAuth}),
}));

//apiserv--
vi.mock("../services/useApiService", () => ({
  useApiService: () => ({makeReq: mockApiCall}),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Login Page", () => {
  it("login-rendeer test", () => {
    render(<Login />);
    expect(screen.getByText("Asset Platform")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
  });

  //inp test
  it("inp test", () => {
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: {value: "testUser@mail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("xxxxxxx"), {
      target: { value: "1234567" },
    });
    expect(screen.getByDisplayValue("testUser@mail.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1234567")).toBeInTheDocument();
  });

  //success test-
  it("login success test", async() => {
    mockApiCall.mockResolvedValue({success: true,
      data: {token: "xyz12",user: {id: 1, name: "testjeh" }}
    });
    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "testjeh@mail.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("xxxxxxx"), {
      target: { value: "1234567" }
    });

    fireEvent.click(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(testSetAuth).toHaveBeenCalledWith("xyz12",{ id: 1, name: "testjeh" },true);
      expect(tstNavigate).toHaveBeenCalledWith("/dashboard", {replace: true});
    });
  });

  //fail case testin-
    it("login fail-test", async () => {
    mockApiCall.mockResolvedValue({
      success: false,
      message: "Invalid credentials",
    });
    render(<Login/>);

    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "tstInv@mail.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("xxxxxxx"), {
      target: { value: "xyinv" }
    });

    fireEvent.click(screen.getByText("Sign in"));
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

});