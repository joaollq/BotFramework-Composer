// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ComboBox } from 'office-ui-fabric-react/lib/ComboBox';

import { StoreContext } from '../../../store';

import { validateEnvironment, validateName, validateRegion, validateSecret } from './validators';
import { styles } from './styles';
// TODO: verify that this is the correct/complete list of azure regions
// https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.documents.locationnames?view=azure-dotnet
import { regionOptions } from './luisRegions.js';

export const DeployWizardStepCreate = (props) => {
  const { nextStep, closeModal } = props;
  const { state } = useContext(StoreContext);
  const { botName, projectId } = state;
  const [disable, setDisable] = useState(false);

  const [formData, setFormData] = useState({
    name: botName,
    location: path.join(process.env.LOCAL_PUBLISH_PATH, projectId).replace(/\\/g, '/'), // use plugin localtion to support deployment
    secret: '',
    environment: '',
    region: regionOptions[0],
    errors: {},
  });

  const nameRef = useRef(null);
  const focusNameRef = () => nameRef.current.focus();
  const environmentRef = useRef(null);
  const focusEnvironmentRef = () => environmentRef.current.focus();
  const appSecretRef = useRef(null);
  const focusAppSecretRef = () => appSecretRef.current.focus();
  const regionRef = useRef(null);
  const focusRegionRef = () => regionRef.current.focus();

  useEffect(() => {
    if (!formData.name || !formData.environment || !formData.secret || !formData.region) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [formData.name, formData.environment, formData.appSecretRef, formData.region]);

  const nextEnabled = () => {
    if (
      Object.keys(formData.errors).length ||
      !formData.name ||
      !formData.environment ||
      !formData.secret ||
      !Object.keys(formData.region).length
    ) {
      setDisable(true);
      return false;
    }
    setDisable(false);
    return true;
  };

  const updateForm = (field) => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
    setDisable(false);
  };

  const setAppSecretErrors = () => {
    let appSecretErrors;
    if (validateSecret(formData.secret) !== true) {
      appSecretErrors = validateSecret(formData.secret);
    }
    if (appSecretErrors) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          secret: appSecretErrors,
        },
      });
    }

    return nextEnabled();
  };

  const setEnvironmentErrors = () => {
    let environmentError;
    if (validateEnvironment(formData.environment) !== true) {
      environmentError = validateEnvironment(formData.environment);
    }
    if (environmentError) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          environment: environmentError,
        },
      });
    }

    return nextEnabled();
  };

  const setNameErrors = () => {
    let nameError;
    if (validateName(formData.name) !== true) {
      nameError = validateName(formData.name);
    }
    if (nameError) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          name: nameError,
        },
      });
    }
    return nextEnabled();
  };

  const setRegionErrors = () => {
    let regionError;
    if (validateName(formData.region) !== true) {
      regionError = validateRegion(formData.region);
    }
    if (regionError) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          region: regionError,
        },
      });
    }
    return nextEnabled();
  };

  const validateForm = () => {
    const nameErrors = setNameErrors();

    const environmentErrors = setEnvironmentErrors();

    const appSecretErrors = setAppSecretErrors();

    const regionErrors = setRegionErrors();

    return nameErrors && environmentErrors && appSecretErrors && regionErrors;
  };

  const submit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      nextStep(formData);
    } else {
      if (formData.errors.name) {
        focusNameRef();
      } else if (formData.errors.environment) {
        focusEnvironmentRef();
      } else if (formData.errors.secret) {
        focusAppSecretRef();
      } else {
        focusRegionRef();
      }
    }
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        <Stack gap="2rem" horizontal styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              autoFocus
              componentRef={nameRef}
              data-testid="displayname"
              defaultValue={botName}
              errorMessage={formData.errors.name}
              label={formatMessage('Bot Display Name')}
              onBlur={useCallback(() => setNameErrors())}
              onChange={updateForm('name')}
              required
              styles={styles.input}
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('This is the name that your user will see.')}</p>
          </StackItem>
        </Stack>
        <Stack gap="2rem" horizontal styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              componentRef={environmentRef}
              data-testid="displayname"
              errorMessage={formData.errors.environment}
              label={formatMessage('Environment Name')}
              onBlur={useCallback(() => setEnvironmentErrors())}
              onChange={updateForm('environment')}
              required
              styles={styles.input}
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('A name for this instance of your bot on Azure. (Staging, Production, testing, etc)')}</p>
          </StackItem>
        </Stack>
        <Stack gap="2rem" horizontal styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              autoComplete={'off'}
              componentRef={appSecretRef}
              data-testid="appsecret"
              errorMessage={formData.errors.secret}
              label={formatMessage('App Secret')}
              mask="****************"
              maxLength={16}
              onBlur={useCallback(() => setAppSecretErrors())}
              onChange={updateForm('secret')}
              required
              styles={styles.input}
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>
              {formatMessage(
                'A 16-character secret used to securely identify and validate your bot. Must include at least 1 number and 1 special character.'
              )}
            </p>
          </StackItem>
        </Stack>

        <Stack gap="2rem" horizontal styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <ComboBox
              autoComplete={'on'}
              componentRef={regionRef}
              data-testid="region"
              defaultSelectedKey={regionOptions[0].key}
              errorMessage={formData.errors.region}
              label={formatMessage('Azure Region')}
              onBlur={useCallback(() => setRegionErrors())}
              onChange={updateForm('region')}
              options={regionOptions}
              required
              styles={styles.input}
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('Choose an Azure region for your resources to be located in')}</p>
          </StackItem>
        </Stack>

        <DialogFooter>
          <DefaultButton onClick={closeModal} text={formatMessage('Cancel')} />
          <PrimaryButton disabled={disable} onClick={submit} text={formatMessage('Next')} />
        </DialogFooter>
      </form>
    </Fragment>
  );
};