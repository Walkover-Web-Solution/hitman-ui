/** REGEX to match URL Validations */
export const URL_VALIDATION_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i

/** REGEX to match Origin part of URL */
export const URL_ORIGIN_VALIDATION_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}$/i

export default {
  URL_VALIDATION_REGEX,
  URL_ORIGIN_VALIDATION_REGEX
}
