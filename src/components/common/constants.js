/** REGEX to match URL Validations */
export const URL_VALIDATION_REGEX = /^https?:\/\/(localhost|(?!.{256})(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+((?:[a-z]{1,63})|xn--[a-z0-9]{1,59}))\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i

/** REGEX to match Origin part of URL */
export const URL_ORIGIN_VALIDATION_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}$/i

export default {
  URL_VALIDATION_REGEX,
  URL_ORIGIN_VALIDATION_REGEX
}
