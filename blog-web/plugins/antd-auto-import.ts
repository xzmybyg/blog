export default function AntdAutoImport() {
  return {
    name: 'antd-auto-import',
    transform(code, id) {
      if (id.endsWith('.js') || id.endsWith('.jsx') || id.endsWith('.ts') || id.endsWith('.tsx')) {
        let transformedCode = code
        const regex = /<([A-Z][a-zA-Z]*)/g
        let match

        while ((match = regex.exec(code)) !== null) {
          const component = match[1]
          if (!new RegExp(`import {.*${component}.*} from 'antd';`).test(code)) {
            transformedCode = `import { ${component} } from 'antd';\n` + transformedCode
          }
        }

        // 检查 React 是否已经被导入
        if (!new RegExp(`import React from 'react';`).test(code)) {
          transformedCode = `import React from 'react';\n` + transformedCode
        }

        return transformedCode
      }
    },
  }
}
