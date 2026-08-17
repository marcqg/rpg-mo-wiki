import React from 'react';
import EditThisPage from '@theme-original/EditThisPage';
import type EditThisPageType from '@theme/EditThisPage';
import type {WrapperProps} from '@docusaurus/types';
import Translate from '@docusaurus/Translate';

type Props = WrapperProps<typeof EditThisPageType>;

export default function EditThisPageWrapper(props: Props): JSX.Element {
  const issueUrl = typeof window !== 'undefined'
    ? `https://github.com/marcqg/rpg-mo-wiki/issues/new?template=error-report.md&title=${encodeURIComponent(`Error on "${document.title}"`)}&body=${encodeURIComponent(`## Page\n\n${window.location.href}\n\n## Description\n\n<!-- Describe the error here -->`)}`
    : 'https://github.com/marcqg/rpg-mo-wiki/issues/new?template=error-report.md';

  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center'}}>
      <EditThisPage {...props} />
      <a
        href={issueUrl}
        target="_blank"
        rel="noreferrer noopener"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.875rem',
          color: 'var(--ifm-color-warning-darkest, #b45309)',
          textDecoration: 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm.75-8.25h-1.5v4.5h1.5v-4.5zm0 5.5h-1.5v1.5h1.5v-1.5z"/>
        </svg>
        <Translate
          id="theme.reportError"
          description="Label of the button to report an error on the current page"
        >
          Report an error
        </Translate>
      </a>
    </div>
  );
}
