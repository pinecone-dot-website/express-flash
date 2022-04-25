import { Response } from "express";
import { format } from "util";

interface OptionsInterface {
  unsafe?: boolean;
}

interface Request {
  flash: Function,
  session: {},
}

type Message = string | {} | Record<string, string>[];

/**
 * Expose `flash()` function on requests.
 *
 * @return {Function}
 * @api public
 */
module.exports = function flash(options: OptionsInterface = {}): Function {
  console.log("exports options", options);
  const safe = options.unsafe === undefined ? true : !options.unsafe;

  return function (req: Request, res: Response, next: Function) {
    if (req.flash && safe) {
      return next();
    }

    req.flash = _flash;

    next();
  };
};

/**
 * Queue flash `msg` of the given `type`.
 *
 * Examples:
 *
 *      req.flash('info', 'email sent');
 *      req.flash('error', 'email delivery failed');
 *      req.flash('info', 'email re-sent');
 *      // => 2
 *
 *      req.flash('info');
 *      // => ['email sent', 'email re-sent']
 *
 *      req.flash('info');
 *      // => []
 *
 *      req.flash();
 *      // => { error: ['email delivery failed'], info: [] }
 *
 * Formatting:
 *
 * Flash notifications also support arbitrary formatting support.
 * For example you may pass variable arguments to `req.flash()`
 * and use the %s specifier to be replaced by the associated argument:
 *
 *     req.flash('info', 'email has been sent to %s.', userName);
 *
 * Formatting uses `util.format()`, which is available on Node 0.6+.
 *
 * @param type
 * @param msg
 * @return
 * @api public
 */
function _flash(type?: string, msg?: Message) {
  if (this.session === undefined) {
    throw Error("req.flash() requires sessions");
  }

  var msgs = (this.session.flash = this.session.flash || {});

  if (type && msg) {
    if (arguments.length > 2) {
      const args = Array.prototype.slice.call(arguments, 1);
      msg = format.apply(undefined, args);
    } else if (Array.isArray(msg)) {
      msg.forEach(function (val) {
        (msgs[type] = msgs[type] || []).push(val);
      });
      // return msgs[type]?.length;
    }
    return (msgs[type] = msgs[type] || []).push(msg);
  } else if (type) {
    const arr = msgs[type];
    delete msgs[type];
    return arr || [];
  } else {
    this.session.flash = {};
    return msgs;
  }
}
