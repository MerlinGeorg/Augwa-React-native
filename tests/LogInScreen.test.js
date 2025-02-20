import React from "react";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from "../Augwa/screens/LogInScreen";
import { AuthContext } from "../Augwa/src/context/AuthContext";
import * as SecureStore from 'expo-secure-store';
