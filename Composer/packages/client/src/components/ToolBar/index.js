/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ActionButton, PrimaryButton, Icon } from 'office-ui-fabric-react';
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';

import { headerSub, bot, botButton, actionButton, warningContiner, warningIcon } from './styles';
import { OpenStatus } from './../../constants';

const openInEmulator = url => {
  // this creates a temporary hidden iframe to fire off the bfemulator protocol
  // and start up the emulator
  const i = document.createElement('iframe');
  i.style.display = 'none';
  i.onload = () => i.parentNode.removeChild(i);
  i.src = `bfemulator://livechat.open?botUrl=${encodeURIComponent(url)}`;
  document.body.appendChild(i);
};

export const ToolBar = props => {
  const { botStatus, connectBot, reloadBot, openStorageExplorer, botLoadErrorMsg } = props;
  const connected = botStatus === 'connected';
  return (
    <div css={headerSub}>
      <div css={actionButton}>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'CirclePlus' }}
          onClick={() => openStorageExplorer(OpenStatus.NEW)}
        >
          {formatMessage('New')}
        </ActionButton>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'OpenFolderHorizontal' }}
          onClick={() => openStorageExplorer(OpenStatus.OPEN)}
        >
          {formatMessage('Open')}
        </ActionButton>
        <ActionButton
          css={actionButton}
          iconProps={{ iconName: 'Save' }}
          onClick={() => openStorageExplorer(OpenStatus.SAVEAS)}
        >
          {formatMessage('Save as')}
        </ActionButton>
      </div>
      <div css={bot}>
        {connected &&
          (botLoadErrorMsg === '' ? (
            <ActionButton
              iconProps={{ iconName: 'OpenInNewTab' }}
              css={actionButton}
              style={{ marginTop: '3px' }}
              onClick={() => openInEmulator('http://localhost:3979/api/messages')}
            >
              {formatMessage('Test in Emulator')}
            </ActionButton>
          ) : (
            <div css={warningContiner}>
              <Icon iconName="warning" css={warningIcon} />
              {formatMessage(botLoadErrorMsg)}
            </div>
          ))}
        <PrimaryButton
          css={botButton}
          text={connected ? formatMessage('Reload') : formatMessage('Connect')}
          onClick={() => (connected ? reloadBot() : connectBot())}
        />
      </div>
    </div>
  );
};

ToolBar.propTypes = {
  botStatus: PropTypes.string,
  botLoadErrorMsg: PropTypes.string,
  connectBot: PropTypes.func,
  reloadBot: PropTypes.func,
  openStorageExplorer: PropTypes.func,
};