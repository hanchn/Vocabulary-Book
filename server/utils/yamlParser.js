import fs from 'fs/promises';
import yaml from 'js-yaml';

/**
 * 加载YAML文件并解析为JavaScript对象
 * @param {string} filePath - YAML文件路径
 * @returns {Promise<Array>} - 解析后的对象
 */
export async function loadYamlFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return yaml.load(fileContent) || [];
  } catch (error) {
    console.error(`加载YAML文件失败: ${filePath}`, error);
    throw new Error(`加载YAML文件失败: ${error.message}`);
  }
}

/**
 * 将JavaScript对象保存为YAML文件
 * @param {string} filePath - 保存路径
 * @param {Object} data - 要保存的数据
 * @returns {Promise<void>}
 */
export async function saveYamlFile(filePath, data) {
  try {
    const yamlStr = yaml.dump(data, {
      indent: 2,
      lineWidth: -1
    });
    await fs.writeFile(filePath, yamlStr, 'utf8');
  } catch (error) {
    console.error(`保存YAML文件失败: ${filePath}`, error);
    throw new Error(`保存YAML文件失败: ${error.message}`);
  }
}